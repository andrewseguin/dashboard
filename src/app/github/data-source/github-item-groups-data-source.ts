import {Item} from 'app/github/app-types/item';
import {Label} from 'app/github/app-types/label';
import {ItemFilterer} from 'app/package/items-renderer/filterer';
import {ItemGrouper} from 'app/package/items-renderer/grouper';
import {ItemGroupsDataSource} from 'app/package/items-renderer/data-source';
import {ItemProvider} from 'app/package/items-renderer/provider';
import {ItemSorter} from 'app/package/items-renderer/sorter';
import {ItemViewer, ItemViewerContextProvider} from 'app/package/items-renderer/viewer';
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
  return new ItemProvider(GithubItemDataMetadata, getItemsList(store, type));
}

function createItemViewer(
    configStore: ConfigStore, dataStore: DataStore): ItemViewer<Item, GithubItemView, ViewContext> {
  const viewContextProvider: ItemViewerContextProvider<Item, ViewContext> =
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

  const viewer = new ItemViewer<Item, GithubItemView, ViewContext>(
      GithubItemViewerMetadata, viewContextProvider);
  viewer.setState({views: viewer.getViews().map(v => v.id)});

  return viewer;
}

function createItemSorter(): ItemSorter<Item, Sort, null> {
  const sorter = new ItemSorter(of(null), GithubItemSortingMetadata);
  sorter.setState({sort: 'created', reverse: true});
  return sorter;
}

function createItemsGrouper(labelsDao: ListDao<Label>):
    ItemGrouper<Item, Group, TitleTransformContext> {
  const titleTransformContextProvider =
      labelsDao.map.pipe(map(labelsMap => ({labelsMap: labelsMap})));

  const grouper = new ItemGrouper<Item, Group, TitleTransformContext>(
      titleTransformContextProvider, GithubItemGroupingMetadata);
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
    ItemFilterer<Item, MatcherContext, AutocompleteContext> {
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

  const filterer = new ItemFilterer<Item, MatcherContext, AutocompleteContext>(
      filterContextProvider, tokenizeItem, ItemsFilterMetadata);
  filterer.autocompleteContext = ({items: dataStore.items, labels: dataStore.labels});

  return filterer;
}
