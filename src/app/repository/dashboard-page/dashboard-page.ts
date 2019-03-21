import {CdkPortal} from '@angular/cdk/portal';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject, Subscription} from 'rxjs';
import {delay, takeUntil} from 'rxjs/operators';
import {Header} from '../services';
import {ActiveStore} from '../services/active-repo';
import {Column, Dashboard} from '../services/dao/config/dashboard';

@Component({
  selector: 'dashboard-page',
  styleUrls: ['dashboard-page.scss'],
  templateUrl: 'dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

    this.header.goBack = () => this.router.navigate([`/${this.activeRepo.activeName}/dashboards`]);
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
      private activeRepo: ActiveStore, private header: Header, private cd: ChangeDetectorRef) {
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
                  // Not quite working since the dao takes time to return
                  // this.router.navigate([`${this.activeRepo.activeName}/dashboards`]);
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

  saveDashboard(dashboard: Dashboard) {
    this.activeRepo.activeConfig.dashboards.update(dashboard);
  }
}
