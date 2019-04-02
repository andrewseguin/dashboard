import {Item} from 'app/github/app-types/item';
import {Label} from 'app/github/app-types/label';
import {ItemGroupsDataSource} from 'app/package/data-source/data-source';
import {Filterer} from 'app/package/data-source/filterer';
import {Grouper} from 'app/package/data-source/grouper';
import {Provider} from 'app/package/data-source/provider';
import {Sorter} from 'app/package/data-source/sorter';
import {RenderContextProvider, Viewer} from 'app/package/data-source/viewer';
import {ConfigStore} from 'app/repository/services/dao/config/config-dao';
import {getRecommendations} from 'app/repository/utility/get-recommendations';
import {combineLatest, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {ActiveStore} from '../../repository/services/active-store';
import {DataStore} from '../../repository/services/dao/data-dao';
import {ListDao} from '../../repository/services/dao/list-dao';
import {tokenizeItem} from '../utility/tokenize-item';
import {AutocompleteContext, ItemsFilterMetadata, MatcherContext} from './item-filter-metadata';
import {GithubItemGroupingMetadata, Group, TitleTransformContext} from './item-grouper-metadata';
import {GithubItemDataMetadata} from './item-provider-metadata';
import {GithubItemSortingMetadata, Sort} from './item-sorter-metadata';
import {GithubItemView, GithubItemViewerMetadata, ViewContext} from './item-viewer-metadata';

export class GithubItemGroupsDataSource extends ItemGroupsDataSource<Item> {
  constructor(activeRepo: ActiveStore, type: 'issue'|'pr') {
    super();

    const dataStore = activeRepo.activeData;
    const configStore = activeRepo.activeConfig;

    this.provider = createProvider(dataStore, type);
    this.filterer = createItemsFilterer(configStore, dataStore);
    this.grouper = createItemsGrouper(dataStore.labels);
    this.sorter = createItemSorter();
    this.viewer = createItemViewer(configStore, dataStore);
  }
}

function createProvider(store: DataStore, type: 'issue'|'pr') {
  return new Provider(GithubItemDataMetadata, getItemsList(store, type));
}

function createItemViewer(
    configStore: ConfigStore, dataStore: DataStore): Viewer<Item, GithubItemView, ViewContext> {
  const viewContextProvider: RenderContextProvider<Item, ViewContext> =
      combineLatest(configStore.recommendations.list, dataStore.labels.map).pipe(map(results => {
        const recommendations = results[0];
        const labelsMap = results[1];

        // Add name to labels map for filtering
        labelsMap.forEach(label => labelsMap.set(label.name, label));

        return (item: Item) => {
          return {
            item,
            labelsMap,
            recommendations: getRecommendations(item, recommendations, labelsMap),
          };
        };
      }));

  const viewer =
      new Viewer<Item, GithubItemView, ViewContext>(GithubItemViewerMetadata, viewContextProvider);
  viewer.setState({views: viewer.getViews().map(v => v.id)});

  return viewer;
}

function createItemSorter(): Sorter<Item, Sort, null> {
  const sorter = new Sorter(GithubItemSortingMetadata, of(null));
  sorter.setState({sort: 'created', reverse: true});
  return sorter;
}

function createItemsGrouper(labelsDao: ListDao<Label>):
    Grouper<Item, Group, TitleTransformContext> {
  const titleTransformContextProvider =
      labelsDao.map.pipe(map(labelsMap => ({labelsMap: labelsMap})));

  const grouper = new Grouper<Item, Group, TitleTransformContext>(
      GithubItemGroupingMetadata, titleTransformContextProvider);
  grouper.setState({group: 'all'});
  return grouper;
}


export function getItemsList(store: DataStore, type: string) {
  return combineLatest(store.items.list).pipe(map(results => {
    const items = results[0];

    const issues = items.filter(item => !item.pr);
    const pullRequests = items.filter(item => !!item.pr);
    return type === 'issue' ? issues : pullRequests;
  }));
}

export function createItemsFilterer(configStore: ConfigStore, dataStore: DataStore):
    Filterer<Item, MatcherContext, AutocompleteContext> {
  const filterContextProvider =
      combineLatest(configStore.recommendations.list, dataStore.labels.map).pipe(map(results => {
        const recommendations = results[0];
        const labelsMap = results[1];

        // Add name to labels map for filtering
        labelsMap.forEach(label => labelsMap.set(label.name, label));


        return (item: Item) => {
          return {
            item,
            labelsMap,
            recommendations: getRecommendations(item, recommendations, labelsMap),
          };
        };
      }));

  const filterer = new Filterer<Item, MatcherContext, AutocompleteContext>(
      ItemsFilterMetadata, tokenizeItem, filterContextProvider);
  filterer.autocompleteContext = ({items: dataStore.items, labels: dataStore.labels});

  return filterer;
}
