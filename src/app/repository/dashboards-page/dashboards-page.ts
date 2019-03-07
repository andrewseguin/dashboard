import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Router} from '@angular/router';

import {ActivatedRepository} from '../services/activated-repository';
import {Dashboard, DashboardsDao} from '../services/dao/dashboards-dao';
import {DashboardDialog} from '../shared/dialog/dashboard/dashboard-dialog';

@Component({
  selector: 'dashboards-page',
  styleUrls: ['dashboards-page.scss'],
  templateUrl: 'dashboards-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardsPage {
  trackById = (_i, dashboard: Dashboard) => dashboard.id;

  constructor(
      public dashboardsDao: DashboardsDao, private router: Router,
      public dashboardDialog: DashboardDialog, private activatedRepository: ActivatedRepository) {}

  createDashboard() {
    this.router.navigate([`${this.activatedRepository.repository.value}/dashboard/new`]);
  }

  navigateToDashboard(id: string) {
    this.router.navigate([`${this.activatedRepository.repository.value}/dashboard/${id}`]);
  }
}
