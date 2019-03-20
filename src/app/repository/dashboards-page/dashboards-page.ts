import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Router} from '@angular/router';
import {ActiveStore} from '../services/active-store';
import {Dashboard} from '../services/dao/config/dashboard';
import {DashboardDialog} from '../shared/dialog/dashboard/dashboard-dialog';


@Component({
  selector: 'dashboards-page',
  styleUrls: ['dashboards-page.scss'],
  templateUrl: 'dashboards-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardsPage {
  trackById = (_i: number, dashboard: Dashboard) => dashboard.id;

  list = this.activeStore.activeConfig.dashboards.list;

  constructor(
      private router: Router, public dashboardDialog: DashboardDialog,
      private activeStore: ActiveStore) {}

  createDashboard() {
    this.router.navigate([`${this.activeStore.activeName}/dashboard/new`]);
  }

  navigateToDashboard(id: string) {
    this.router.navigate([`${this.activeStore.activeName}/dashboard/${id}`]);
  }
}
