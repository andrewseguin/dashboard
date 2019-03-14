import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {interval, Subject} from 'rxjs';
import {filter, mergeMap, take, takeUntil} from 'rxjs/operators';
import {ActivatedRepository} from './services/activated-repository';
import {ItemsDao} from './services/dao';
import {DaoState} from './services/dao/dao-state';
import {RepoGist} from './services/repo-gist';
import {Updater} from './services/updater';


@Component({
  templateUrl: 'repository.html',
  styleUrls: ['repository.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Repository {
  destroyed = new Subject();

  constructor(
      private router: Router, private updater: Updater, private daoState: DaoState,
      private repoGist: RepoGist, private activatedRoute: ActivatedRoute,
      private itemsDao: ItemsDao, private activatedRepository: ActivatedRepository) {
    this.activatedRoute.params.pipe(takeUntil(this.destroyed)).subscribe(params => {
      const org = params['org'];
      const name = params['name'];
      this.activatedRepository.repository.next(`${org}/${name}`);
    });

    // Sync from Github Gist, then begin saving any changes to the IndexedDB
    this.repoGist.sync().then(() => this.repoGist.saveChanges());

    this.daoState.isEmpty.pipe(take(1)).subscribe(isEmpty => {
      if (isEmpty) {
        this.router.navigate([`${this.activatedRepository.repository.value}/database`]);
      } else {
        this.initializeAutoIssueUpdates();
      }
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private initializeAutoIssueUpdates() {
    interval(60 * 1000)
        .pipe(
            mergeMap(() => this.itemsDao.list.pipe(take(1))),
            filter(items => !!items && items.length > 0))
        .subscribe(() => {
          this.updater.updateIssues();
        });
    this.updater.updateContributors();
    this.updater.updateLabels();
  }
}
