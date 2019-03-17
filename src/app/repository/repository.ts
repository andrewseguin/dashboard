import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Router} from '@angular/router';
import {Auth} from 'app/service/auth';
import {LoadedRepos} from 'app/service/loaded-repos';
import {interval, Subject} from 'rxjs';
import {filter, mergeMap, take} from 'rxjs/operators';
import {ActiveRepo} from './services/active-repo';
import {RepoStore} from './services/dao/dao';
import {Remover} from './services/remover';
import {Updater} from './services/updater';
import {isRepoStoreEmpty} from './utility/is-repo-store-empty';


@Component({
  templateUrl: 'repository.html',
  styleUrls: ['repository.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Repository {
  destroyed = new Subject();

  constructor(
      private router: Router, private updater: Updater, private loadedRepos: LoadedRepos,
      private remover: Remover, private activeRepo: ActiveRepo, private auth: Auth) {
    this.activeRepo.store.pipe(mergeMap(store => isRepoStoreEmpty(store).pipe(take(1))))
        .subscribe(isEmpty => {
          const store = this.activeRepo.activeStore;
          const isLoaded = this.loadedRepos.isLoaded(store.repository);

          if (!isEmpty && !isLoaded) {
            this.remover.removeAllData(store, false);
          }

          if (isEmpty) {
            this.router.navigate([`${store.repository}/database`]);
          } else if (this.auth.token) {
            this.initializeAutoIssueUpdates(this.activeRepo.activeStore);
          }
        });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private initializeAutoIssueUpdates(store: RepoStore) {
    interval(60 * 1000)
        .pipe(mergeMap(() => store.items.list.pipe(take(1))), filter(items => items.length > 0))
        .subscribe(() => {
          this.updater.update(store, 'items');
        });
    this.updater.update(store, 'contributors');
    this.updater.update(store, 'labels');
  }
}
