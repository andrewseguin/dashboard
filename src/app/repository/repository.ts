import {ChangeDetectionStrategy, Component, InjectionToken} from '@angular/core';
import {Router} from '@angular/router';
import {
  createFiltererContextProvider,
  ItemsFilterMetadata
} from 'app/github/data-source/item-filter-metadata';
import {
  createGrouperContextProvider,
  GithubItemGroupingMetadata
} from 'app/github/data-source/item-grouper-metadata';
import {GithubItemDataMetadata} from 'app/github/data-source/item-provider-metadata';
import {GithubItemSortingMetadata} from 'app/github/data-source/item-sorter-metadata';
import {
  createViewerContextProvider,
  GithubItemViewerMetadata
} from 'app/github/data-source/item-viewer-metadata';
import {tokenizeItem} from 'app/github/utility/tokenize-item';
import {Filterer} from 'app/package/data-source/filterer';
import {Grouper} from 'app/package/data-source/grouper';
import {Provider} from 'app/package/data-source/provider';
import {Sorter} from 'app/package/data-source/sorter';
import {Viewer} from 'app/package/data-source/viewer';
import {DataSourceProvider} from 'app/package/utility/data-source-provider';
import {Auth} from 'app/service/auth';
import {LoadedRepos} from 'app/service/loaded-repos';
import {interval, of} from 'rxjs';
import {filter, map, mergeMap, take} from 'rxjs/operators';
import {GithubItemDataSource} from '../github/data-source/github-item-groups-data-source';
import {ActiveStore} from './services/active-store';
import {DataStore} from './services/dao/data-dao';
import {Remover} from './services/remover';
import {Updater} from './services/updater';
import {getRecommendations} from './utility/get-recommendations';
import {isRepoStoreEmpty} from './utility/is-repo-store-empty';

export const DATA_SOURCES = new InjectionToken<Map<string, DataSourceProvider>>('data-sources');

export const provideDataSources = (activeStore: ActiveStore) => {
  const recommendations = activeStore.activeConfig.recommendations.list;
  const labels = activeStore.activeData.labels.list;

  return new Map<string, DataSourceProvider>([
    [
      'issue', {
        id: 'issue',
        label: 'Issues',
        viewer: () => {
          const viewer = new Viewer(
              GithubItemViewerMetadata, createViewerContextProvider(labels, recommendations));
          viewer.setState({views: viewer.getViews().map(v => v.id)});
          return viewer;
        },
        filterer: () => {
          const filterer = new Filterer(
              ItemsFilterMetadata,
              createFiltererContextProvider(labels, recommendations, getRecommendations));
          filterer.setState({filters: [], search: ''});
          filterer.tokenizeItem = tokenizeItem;
          return filterer;
        },
        grouper: () => {
          const grouper =
              new Grouper(GithubItemGroupingMetadata, createGrouperContextProvider(labels));
          grouper.setState({group: 'all'});
          return grouper;
        },
        sorter: () => {
          const sorter = new Sorter(GithubItemSortingMetadata, of(null));
          sorter.setState({sort: 'created', reverse: true});
          return sorter;
        },
        provider: () => {
          const data =
              activeStore.activeData.items.list.pipe(map(items => items.filter(item => !item.pr)));
          return new Provider(GithubItemDataMetadata, data);
        },
        factory: () => {
          return new GithubItemDataSource();
        }
      }
    ],
    [
      'pr', {
        id: 'pr',
        label: 'Pull Requests',
        viewer: () => {
          const viewer = new Viewer(
              GithubItemViewerMetadata, createViewerContextProvider(labels, recommendations));
          viewer.setState({views: viewer.getViews().map(v => v.id)});
          return viewer;
        },
        filterer: () => {
          const filterer = new Filterer(
              ItemsFilterMetadata,
              createFiltererContextProvider(labels, recommendations, getRecommendations));
          filterer.setState({filters: [], search: ''});
          filterer.tokenizeItem = tokenizeItem;
          return filterer;
        },
        grouper: () => {
          const grouper =
              new Grouper(GithubItemGroupingMetadata, createGrouperContextProvider(labels));
          grouper.setState({group: 'all'});
          return grouper;
        },
        sorter: () => {
          const sorter = new Sorter(GithubItemSortingMetadata, of(null));
          sorter.setState({sort: 'created', reverse: true});
          return sorter;
        },
        provider: () => {
          const data =
              activeStore.activeData.items.list.pipe(map(items => items.filter(item => !!item.pr)));
          return new Provider(GithubItemDataMetadata, data);
        },
        factory: () => {
          return new GithubItemDataSource();
        }
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
