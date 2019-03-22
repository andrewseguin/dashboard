import {CdkPortal} from '@angular/cdk/portal';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Column, Dashboard, hasWidgets} from 'app/package/component/dashboard/dashboard';
import {DataSource} from 'app/package/component/dashboard/widget-view/widget-view';
import {Subject, Subscription} from 'rxjs';
import {delay, takeUntil} from 'rxjs/operators';
import {Header} from '../services';
import {ActiveStore} from '../services/active-repo';
import {getItemsList, GithubItemGroupsDataSource} from '../services/github-item-groups-data-source';
import {ItemRecommendations} from '../services/item-recommendations';

@Component({
  selector: 'dashboard-page',
  styleUrls: ['dashboard-page.scss'],
  templateUrl: 'dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  dashboard: Dashboard;

  edit = new FormControl();

  trackByIndex = (i: number) => i;

  dataSources = new Map<string, DataSource>([
    [
      'issue', {
        id: 'issue',
        label: 'Issues',
        factory:
            () => {
              const datasource =
                  new GithubItemGroupsDataSource(this.itemRecommendations, this.activeRepo);
              datasource.dataProvider = getItemsList(this.activeRepo.activeData, 'issue');
              return datasource;
            }
      }
    ],
    [
      'pr', {
        id: 'pr',
        label: 'Pull Requests',
        factory:
            () => {
              const datasource =
                  new GithubItemGroupsDataSource(this.itemRecommendations, this.activeRepo);
              datasource.dataProvider = getItemsList(this.activeRepo.activeData, 'pr');
              return datasource;
            }
      }
    ],
  ]);

  private destroyed = new Subject();

  private getSubscription: Subscription;

  @ViewChild(CdkPortal) toolbarActions: CdkPortal;

  constructor(
      private router: Router, private activatedRoute: ActivatedRoute,
      private itemRecommendations: ItemRecommendations, private activeRepo: ActiveStore,
      private header: Header, private cd: ChangeDetectorRef) {
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
                const dashboard = map.get(id);
                if (dashboard) {
                  this.setDashboard(dashboard);
                }
                this.cd.markForCheck();
              });
    });
  }

  private createNewDashboard() {
    const columns: Column[] = [{widgets: []}, {widgets: []}, {widgets: []}];
    const newDashboard: Dashboard = {name: 'New Dashboard', columnGroups: [{columns}]};
    this.setDashboard(newDashboard);
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

  setDashboard(dashboard: Dashboard) {
    this.dashboard = dashboard;
    this.header.title.next(this.dashboard.name || '');

    if (!hasWidgets(dashboard)) {
      this.edit.setValue(true);
    }

    this.header.goBack = true;
  }
}
