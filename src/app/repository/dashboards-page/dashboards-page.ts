import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Router} from '@angular/router';
import {ActivatedRepository} from '../services/activated-repository';
import {Dao} from '../services/dao/dao';
import {Dashboard} from '../services/dao/dashboards-dao';
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
      private activatedRepository: ActivatedRepository) {}

  createDashboard() {
    this.router.navigate([`${this.activatedRepository.repository.value}/dashboard/new`]);
  }

  navigateToDashboard(id: string) {
    this.router.navigate([`${this.activatedRepository.repository.value}/dashboard/${id}`]);
  }
}
