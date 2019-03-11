import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {CdkPortal} from '@angular/cdk/portal';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {ItemRendererOptions} from 'app/package/items-renderer/item-renderer-options';
import {Subject, Subscription} from 'rxjs';
import {delay, filter, take, takeUntil} from 'rxjs/operators';
import {Header} from '../services';
import {ActivatedRepository} from '../services/activated-repository';
import {
  Column,
  ColumnGroup,
  Dashboard,
  DashboardsDao,
  Widget
} from '../services/dao/dashboards-dao';
import {EditWidget, EditWidgetData} from '../shared/dialog/edit-widget/edit-widget';


@Component({
  selector: 'dashboard-page',
  styleUrls: ['dashboard-page.scss'],
  templateUrl: 'dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'[class.edit-mode]': 'edit.value'}
})
export class DashboardPage {
  set dashboard(dashboard: Dashboard) {
    this._dashboard = dashboard;
    this.header.title.next(this.dashboard.name);

    const hasWidgets = this.dashboard.columnGroups.some(columnGroup => {
      return columnGroup.columns.some(column => {
        return column.widgets.some(widget => true);
      });
    });

    if (!hasWidgets) {
      this.edit.setValue(true);
    }

    const repository = this.activatedRepository.repository.value;
    this.header.goBack = () => this.router.navigate([`/${repository}/dashboards`]);
  }
  get dashboard(): Dashboard {
    return this._dashboard;
  }
  private _dashboard: Dashboard;

  edit = new FormControl();

  private destroyed = new Subject();

  private getSubscription: Subscription;

  @ViewChild(CdkPortal) toolbarActions: CdkPortal;

  constructor(
      private router: Router, private activatedRoute: ActivatedRoute,
      private dashboardsDao: DashboardsDao, private activatedRepository: ActivatedRepository,
      private header: Header, private cd: ChangeDetectorRef, private dialog: MatDialog) {
    this.edit.valueChanges.pipe(takeUntil(this.destroyed)).subscribe(() => this.cd.markForCheck());

    this.activatedRoute.params.pipe(takeUntil(this.destroyed)).subscribe(params => {
      const id = params['id'];

      if (this.getSubscription) {
        this.getSubscription.unsubscribe();
      }

      if (id === 'new') {
        const columns: Column[] = [{widgets: []}, {widgets: []}, {widgets: []}];
        const newDashboard: Dashboard = {name: 'New Dashboard', columnGroups: [{columns}]};
        this.dashboard = newDashboard;
        const newDashboardId = this.dashboardsDao.add(newDashboard);
        this.router.navigate(
            [`${this.activatedRepository.repository.value}/dashboard/${newDashboardId}`],
            {replaceUrl: true, queryParamsHandling: 'merge'});
        return;
      }

      // Delay added to improve page responsiveness on first load
      this.getSubscription =
          this.dashboardsDao.map.pipe(delay(0), takeUntil(this.destroyed), filter(map => !!map))
              .subscribe(map => {
                if (map.get(id)) {
                  this.dashboard = map.get(id);
                } else {
                  this.router.navigate([`${this.activatedRepository.repository.value}/dashboards`]);
                }
                this.cd.markForCheck();
              });
    });
  }

  ngOnInit() {
    this.header.toolbarOutlet.next(this.toolbarActions);
  }

  ngOnDestroy() {
    this.header.toolbarOutlet.next(null);
    this.destroyed.next();
    this.destroyed.complete();
  }

  addColumnGroup() {
    this.dashboard.columnGroups.push({columns: [{widgets: []}]});
    this.save();
  }

  addColumn(columnGroup: ColumnGroup) {
    columnGroup.columns.push({widgets: []});
    this.save();
  }

  addWidget(column: Column) {
    const widget: Widget = {
      title: 'New Widget',
      options: new ItemRendererOptions().getState(),
      itemType: 'issue',
      displayType: 'list'
    };
    const config: MatDialogConfig<EditWidgetData> = {width: '650px', data: {widget}};

    this.dialog.open(EditWidget, config).afterClosed().pipe(take(1)).subscribe((result: Widget) => {
      if (result) {
        column.widgets.push(result);
        this.save();
      }
    });
  }

  editWidget(column: Column, index: number) {
    const config:
        MatDialogConfig<EditWidgetData> = {width: '650px', data: {widget: column.widgets[index]}};

    this.dialog.open(EditWidget, config).afterClosed().pipe(take(1)).subscribe((result: Widget) => {
      if (result) {
        column.widgets[index] = {...result};
        this.save();
      }
    });
  }

  removeColumnGroup(index: number) {
    this.dashboard.columnGroups.splice(index, 1);
    this.save();
  }

  removeColumn(columnGroup: ColumnGroup, index: number) {
    columnGroup.columns.splice(index, 1);
    this.save();
  }

  removeWidget(column: Column, index: number) {
    column.widgets.splice(index, 1);
    this.save();
  }

  private save() {
    this.dashboardsDao.update(this.dashboard);
    this.cd.markForCheck();
  }

  dropWidget(event: CdkDragDrop<Widget[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
          event.previousContainer.data, event.container.data, event.previousIndex,
          event.currentIndex);
    }
    this.save();
  }
}
