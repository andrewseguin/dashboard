import {ChangeDetectionStrategy, Component, InjectionToken} from '@angular/core';
import {Router} from '@angular/router';
import {DataSourceProvider} from 'app/package/items-renderer/data-source-provider';
import {Auth} from 'app/service/auth';
import {LoadedRepos} from 'app/service/loaded-repos';
import {interval, Subject} from 'rxjs';
import {filter, mergeMap, take} from 'rxjs/operators';
import {GithubItemGroupsDataSource} from '../github/data-source/github-item-groups-data-source';
import {ActiveStore} from './services/active-store';
import {DataStore} from './services/dao/data-dao';
import {Remover} from './services/remover';
import {Updater} from './services/updater';
import {isRepoStoreEmpty} from './utility/is-repo-store-empty';

export const DATA_SOURCES = new InjectionToken<Map<string, DataSourceProvider>>('data-sources');

export const provideDataSources = (activeStore: ActiveStore) => {
  return new Map<string, DataSourceProvider>([
    [
      'issue', {
        id: 'issue',
        label: 'Issues',
        factory: () => new GithubItemGroupsDataSource(activeStore, 'issue')
      }
    ],
    [
      'pr', {
        id: 'pr',
        label: 'Pull Requests',
        factory: () => new GithubItemGroupsDataSource(activeStore, 'pr')
      }
    ],
  ]);
};

@Component({
  templateUrl: 'repository.html',
  styleUrls: ['repository.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{provide: DATA_SOURCES, useFactory: provideDataSources, deps: [ActiveStore]}]
})
export class Repository {
  destroyed = new Subject();

  constructor(
      private router: Router, private updater: Updater, private loadedRepos: LoadedRepos,
      private remover: Remover, private activeRepo: ActiveStore, private auth: Auth) {
    this.activeRepo.data.pipe(mergeMap(store => isRepoStoreEmpty(store).pipe(take(1))))
        .subscribe(isEmpty => {
          const store = this.activeRepo.activeData;
          const isLoaded = this.loadedRepos.isLoaded(store.name);

          if (!isEmpty && !isLoaded) {
            this.remover.removeAllData(store);
          }

          if (isEmpty) {
            this.router.navigate([`${store.name}/database`]);
          } else if (this.auth.token) {
            this.initializeAutoIssueUpdates(this.activeRepo.activeData);
          }
        });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private initializeAutoIssueUpdates(store: DataStore) {
    interval(60 * 1000)
        .pipe(mergeMap(() => store.items.list.pipe(take(1))), filter(items => items.length > 0))
        .subscribe(() => {
          this.updater.update(store, 'items');
        });

    this.updater.update(store, 'contributors');
    this.updater.update(store, 'labels');
  }
}
