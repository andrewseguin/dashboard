import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Router} from '@angular/router';

import {ActivatedRepository} from '../services/activated-repository';
import {Dashboard, DashboardsDao} from '../services/dao/dashboards-dao';

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
      private activatedRepository: ActivatedRepository) {}

  newDashboard() {
    this.dashboardsDao.add({name: 'New Dashboard', columnGroups: [{columns: [{widgets: []}]}]})
        .then(id => {
          this.router.navigate(
              [`${this.activatedRepository.repository.value}/dashboard/${id}`],
              {queryParams: {edit: true}});
        });
  }

  navigateToDashboard(id: string) {
    this.router.navigate([`${this.activatedRepository.repository.value}/dashboard/${id}`]);
  }
}
