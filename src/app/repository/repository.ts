import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatDialog} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {RepoDao} from 'app/service/repo-dao';
import {interval, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {ActivatedRepository} from './services/activated-repository';
import {Updater} from './services/updater';

@Component({
  templateUrl: 'repository.html',
  styleUrls: ['repository.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Repository {
  repository = 'angular/material2';

  destroyed = new Subject();

  constructor(
      public repoStoreDao: RepoDao, private dialog: MatDialog, private router: Router,
      private updater: Updater, private activatedRoute: ActivatedRoute,
      private activatedRepository: ActivatedRepository) {
    this.activatedRoute.params.pipe(takeUntil(this.destroyed)).subscribe(params => {
      const org = params['org'];
      const name = params['name'];
      this.repository = `${org}/${name}`;
      this.repoStoreDao.initialize(this.repository);
      this.activatedRepository.repository.next(this.repository);
    });

    const checked = new Subject();
    this.repoStoreDao.repo.pipe(takeUntil(checked)).subscribe(result => {
      if (!result) {
        return;
      }

      checked.next();
      checked.complete();

      if (result.empty) {
        this.router.navigate([`${this.activatedRepository.repository.value}/database`]);
      } else {
        this.initializAutoIssueUpdates();
      }
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private initializAutoIssueUpdates() {
    interval(20 * 1000).subscribe(() => {
      console.log('updating issues');
      this.updater.updateLabels(this.repository);
    });

    this.updater.updateContributors(this.repository);
    this.updater.updateIssues(this.repository);
  }
}
