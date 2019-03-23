import {ChangeDetectionStrategy, Component, InjectionToken} from '@angular/core';
import {Router} from '@angular/router';
import {DataSource} from 'app/package/component/dashboard/widget-view/widget-view';
import {Auth} from 'app/service/auth';
import {LoadedRepos} from 'app/service/loaded-repos';
import {interval, Subject} from 'rxjs';
import {filter, mergeMap, take} from 'rxjs/operators';
import {ActiveStore} from './services/active-store';
import {DataStore} from './services/dao/data/data-dao';
import {getItemsList, GithubItemGroupsDataSource} from './services/github-item-groups-data-source';
import {ItemRecommendations} from './services/item-recommendations';
import {Remover} from './services/remover';
import {Updater} from './services/updater';
import {isRepoStoreEmpty} from './utility/is-repo-store-empty';

export const DATA_SOURCES = new InjectionToken<any>('data-sources');

export const provideDataSources =
    (itemRecommendations: ItemRecommendations, activeStore: ActiveStore) => {
      return new Map<string, DataSource>([
        [
          'issue', {
            id: 'issue',
            label: 'Issues',
            factory: () => {
              const datasource = new GithubItemGroupsDataSource(itemRecommendations, activeStore);
              datasource.dataProvider = getItemsList(activeStore.activeData, 'issue');
              return datasource;
            }
          }
        ],
        [
          'pr', {
            id: 'pr',
            label: 'Pull Requests',
            factory: () => {
              const datasource = new GithubItemGroupsDataSource(itemRecommendations, activeStore);
              datasource.dataProvider = getItemsList(activeStore.activeData, 'pr');
              return datasource;
            }
          }
        ],
      ]);
    };

@Component({
  templateUrl: 'repository.html',
  styleUrls: ['repository.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: DATA_SOURCES,
    useFactory: provideDataSources,
    deps: [ItemRecommendations, ActiveStore]
  }]
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
