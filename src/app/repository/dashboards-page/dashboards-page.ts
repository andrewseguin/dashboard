import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Router} from '@angular/router';
import {ActiveRepo} from '../services/active-repo';
import {Dao} from '../services/dao/dao';
import {Dashboard} from '../services/dao/dashboard';
import {DashboardDialog} from '../shared/dialog/dashboard/dashboard-dialog';


@Component({
  selector: 'dashboards-page',
  styleUrls: ['dashboards-page.scss'],
  templateUrl: 'dashboards-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardsPage {
  trackById = (_i: number, dashboard: Dashboard) => dashboard.id;

  constructor(
      public dao: Dao, private router: Router, public dashboardDialog: DashboardDialog,
      private activeRepo: ActiveRepo) {}

  createDashboard() {
    this.router.navigate([`${this.activeRepo.repository}/dashboard/new`]);
  }

  navigateToDashboard(id: string) {
    this.router.navigate([`${this.activeRepo.repository}/dashboard/${id}`]);
  }
}
