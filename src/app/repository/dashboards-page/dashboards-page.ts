import {CdkPortal} from '@angular/cdk/portal';
import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {Dashboard} from 'app/package/component/dashboard/dashboard';
import {Header} from '../services';
import {ActiveStore} from '../services/active-repo';
import {DashboardDialog} from '../shared/dialog/dashboard/dashboard-dialog';


@Component({
  selector: 'dashboards-page',
  styleUrls: ['dashboards-page.scss'],
  templateUrl: 'dashboards-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardsPage {
  trackById = (_i: number, dashboard: Dashboard) => dashboard.id;

  list = this.activeRepo.activeConfig.dashboards.list;

  @ViewChild(CdkPortal) toolbarActions: CdkPortal;

  constructor(
      private header: Header, private router: Router, public dashboardDialog: DashboardDialog,
      private activeRepo: ActiveStore) {}

  ngOnInit() {
    this.header.toolbarOutlet.next(this.toolbarActions);
  }

  ngOnDestroy() {
    this.header.toolbarOutlet.next(null);
  }

  createDashboard() {
    this.router.navigate([`${this.activeRepo.activeName}/dashboard/new`]);
  }

  navigateToDashboard(id: string) {
    this.router.navigate([`${this.activeRepo.activeName}/dashboard/${id}`]);
  }
}
