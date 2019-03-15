import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {combineLatest, interval, Subject} from 'rxjs';
import {filter, mergeMap, take, takeUntil} from 'rxjs/operators';
import {ActivatedRepository} from './services/activated-repository';
import {ItemsDao} from './services/dao';
import {Remover} from './services/remover';
import {RepoGist} from './services/repo-gist';
import {RepoLoadState} from './services/repo-load-state';
import {Updater} from './services/updater';


@Component({
  templateUrl: 'repository.html',
  styleUrls: ['repository.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Repository {
  destroyed = new Subject();

  constructor(
      private router: Router, private updater: Updater, private repoLoadState: RepoLoadState,
      private repoGist: RepoGist, private activatedRoute: ActivatedRoute, private remover: Remover,
      private itemsDao: ItemsDao, private activatedRepository: ActivatedRepository) {
    this.activatedRoute.params.pipe(takeUntil(this.destroyed)).subscribe(params => {
      const org = params['org'];
      const name = params['name'];
      this.activatedRepository.repository.next(`${org}/${name}`);
    });

    // If a repository has data but not considered loaded, the load did not successfully complete
    // and the data can be removed.
    combineLatest(this.repoLoadState.isEmpty, this.repoLoadState.isLoaded)
        .pipe(take(1))
        .subscribe(results => {
          const isEmpty = results[1];
          const isLoaded = results[0];
          if (!isEmpty && !isLoaded) {
            this.remover.removeAllData(false);
          }
        });

    // Sync from Github Gist, then begin saving any changes to the IndexedDB
    this.repoGist.sync().then(() => this.repoGist.saveChanges());

    this.repoLoadState.isEmpty.pipe(take(1)).subscribe(isEmpty => {
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
