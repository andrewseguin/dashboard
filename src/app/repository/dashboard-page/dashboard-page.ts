import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {CdkPortal} from '@angular/cdk/portal';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject, Subscription} from 'rxjs';
import {delay, take, takeUntil} from 'rxjs/operators';
import {Header} from '../services';
import {ActiveStore} from '../services/active-repo';
import {Column, ColumnGroup, Dashboard, Widget} from '../services/dao/config/dashboard';
import {EditWidget, EditWidgetData} from './edit-widget/edit-widget';

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
    this.header.title.next(this.dashboard.name || '');

    const columnGroups = this.dashboard.columnGroups || [];
    const hasWidgets = columnGroups.some(columnGroup => {
      return columnGroup.columns.some(column => {
        return column.widgets.some(widget => !!widget);
      });
    });

    if (!hasWidgets) {
      this.edit.setValue(true);
    }

    this.header.goBack = () =>
        this.router.navigate([`/${this.activeRepo.activeName}/dashboards`]);
  }
  get dashboard(): Dashboard {
    return this._dashboard;
  }
  private _dashboard: Dashboard;

  edit = new FormControl();

  trackByIndex = (i: number) => i;

  private destroyed = new Subject();

  private getSubscription: Subscription;

  @ViewChild(CdkPortal) toolbarActions: CdkPortal;

  constructor(
      private router: Router, private activatedRoute: ActivatedRoute,
      private activeRepo: ActiveStore, private header: Header, private cd: ChangeDetectorRef,
      private dialog: MatDialog) {
    this.edit.valueChanges.pipe(takeUntil(this.destroyed)).subscribe(() => this.cd.markForCheck());

    this.activatedRoute.params.pipe(takeUntil(this.destroyed)).subscribe(params => {
      const id = params['id'];

      if (this.getSubscription) {
        this.getSubscription.unsubscribe();
      }

      if (id === 'new') {
        this.createNewDashboard();
        return;
      }

      // Delay added to improve page responsiveness on first load
      this.getSubscription =
          this.activeRepo.activeConfig.dashboards.map.pipe(delay(0), takeUntil(this.destroyed))
              .subscribe(map => {
                if (map.has(id)) {
                  this.dashboard = map.get(id)!;
                } else {
                  this.router.navigate([`${this.activeRepo.activeName}/dashboards`]);
                }
                this.cd.markForCheck();
              });
    });
  }

  private createNewDashboard() {
    const columns: Column[] = [{widgets: []}, {widgets: []}, {widgets: []}];
    const newDashboard: Dashboard = {name: 'New Dashboard', columnGroups: [{columns}]};
    this.dashboard = newDashboard;
    const newDashboardId = this.activeRepo.activeConfig.dashboards.add(newDashboard);
    this.router.navigate(
        [`${this.activeRepo.activeName}/dashboard/${newDashboardId}`],
        {replaceUrl: true, queryParamsHandling: 'merge'});
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
    if (!this.dashboard.columnGroups) {
      this.dashboard.columnGroups = [];
    }

    this.dashboard.columnGroups.push({columns: [{widgets: []}]});
    this.save();
  }

  addColumn(columnGroup: ColumnGroup) {
    columnGroup.columns.push({widgets: []});
    this.save();
  }

  addWidget(column: Column) {
    const config: MatDialogConfig<EditWidgetData> = {width: '650px'};

    this.dialog.open(EditWidget, config).afterClosed().pipe(take(1)).subscribe((result: Widget) => {
      if (result) {
        column.widgets.push(result);
        this.save();
      }
    });
  }

  duplicateWidget(column: Column, widget: Widget, index: number) {
    const newWidget = {...widget};
    column.widgets.splice(index, 0, newWidget);
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
    if (this.dashboard.columnGroups) {
      this.dashboard.columnGroups.splice(index, 1);
      this.save();
    }
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
    this.activeRepo.activeConfig.dashboards.update(this.dashboard);
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
