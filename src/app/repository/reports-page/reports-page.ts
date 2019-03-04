import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Router} from '@angular/router';
import {RepoDao} from 'app/service/repo-dao';
import {ActivatedRepository} from '../services/activated-repository';
import {ReportsDao} from '../services/dao/reports-dao';


@Component({
  styleUrls: ['reports-page.scss'],
  templateUrl: 'reports-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsPage {
  constructor(
      public reportsDao: ReportsDao, public repoDao: RepoDao,
      private router: Router,
      private activatedRepository: ActivatedRepository) {}

  createReport() {
    this.router.navigate(
        [`${this.activatedRepository.repository.value}/issues/new`]);
  }

  navigateToReport(id: string) {
    this.router.navigate(
        [`${this.activatedRepository.repository.value}/issues/${id}`]);
  }
}
