import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Router} from '@angular/router';

import {ActivatedRepository} from '../services/activated-repository';
import {DashboardsDao} from '../services/dao/dashboards-dao';

@Component({
  styleUrls: ['dashboards-page.scss'],
  templateUrl: 'dashboards-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardsPage {
  constructor(
      public dashboardsDao: DashboardsDao, private router: Router,
      private activatedRepository: ActivatedRepository) {}

  newDashboard() {
    this.dashboardsDao.add({name: 'New Dashboard'}).then(id => {
      this.router.navigate([`${this.activatedRepository.repository.value}/dashboard/${id}`]);
    })
  }
}
