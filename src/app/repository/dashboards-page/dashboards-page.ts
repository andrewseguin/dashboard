import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Router} from '@angular/router';
import {ActiveStore} from '../services/active-repo';
import {DashboardDialog} from '../shared/dialog/dashboard/dashboard-dialog';
import { Dashboard } from 'app/package/component/dashboard/dashboard';


@Component({
  selector: 'dashboards-page',
  styleUrls: ['dashboards-page.scss'],
  templateUrl: 'dashboards-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardsPage {
  trackById = (_i: number, dashboard: Dashboard) => dashboard.id;

  list = this.activeRepo.activeConfig.dashboards.list;

  constructor(
      private router: Router, public dashboardDialog: DashboardDialog,
      private activeRepo: ActiveStore) {}

  createDashboard() {
    this.router.navigate([`${this.activeRepo.activeName}/dashboard/new`]);
  }

  navigateToDashboard(id: string) {
    this.router.navigate([`${this.activeRepo.activeName}/dashboard/${id}`]);
  }
}
