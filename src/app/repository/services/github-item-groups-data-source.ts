import {ItemFilterer} from 'app/package/items-renderer/item-filterer';
import {ItemGrouper} from 'app/package/items-renderer/item-grouper';
import {ItemGroupsDataSource} from 'app/package/items-renderer/item-groups-data-source';
import {ItemSorter} from 'app/package/items-renderer/item-sorter';
import {ItemViewer, ItemViewerContextProvider} from 'app/package/items-renderer/item-viewer';
import {combineLatest, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {
  AutocompleteContext,
  ItemsFilterMetadata,
  MatcherContext
} from '../../github/data-source/item-filter-metadata';
import {
  GithubItemGroupingMetadata,
  Group,
  TitleTransformContext
} from '../../github/data-source/item-grouper-metadata';
import {GithubItemSortingMetadata, Sort} from '../../github/data-source/item-sorter-metadata';
import {
  GithubItemView,
  GithubItemViewerMetadata,
  ViewContext
} from '../../github/data-source/item-viewer-metadata';
import {tokenizeItem} from '../../github/utility/tokenize-item';
import {ActiveStore} from './active-store';
import {DataStore} from './dao/data-dao';
import {ListDao} from './dao/list-dao';
import {ItemRecommendations} from './item-recommendations';
import { Item } from 'app/github/app-types/item';
import { Label } from 'app/github/app-types/label';

export class GithubItemGroupsDataSource extends ItemGroupsDataSource<Item> {
  constructor(private itemRecommendations: ItemRecommendations, private activeRepo: ActiveStore) {
    super();

    const store = this.activeRepo.activeData;

    this.filterer = createItemsFilterer(this.itemRecommendations, store);
    this.grouper = createItemsGrouper(store.labels);
    this.sorter = createItemSorter();
    this.viewer = createItemViewer(this.itemRecommendations, store);
  }
}

function createItemViewer(itemRecommendations: ItemRecommendations, store: DataStore):
    ItemViewer<Item, GithubItemView, ViewContext> {
  const viewContextProvider: ItemViewerContextProvider<Item, ViewContext> =
      combineLatest(itemRecommendations.allRecommendations, store.labels.map).pipe(map(results => {
        const recommendationsByItem = results[0]!;
        const labelsMap = results[1]!;

        // Add name to labels map for filtering
        labelsMap.forEach(label => labelsMap.set(label.name, label));

        return (item: Item) => {
          return {
            item,
            labelsMap,
            recommendations: recommendationsByItem.get(item.id) || [],
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

export function createItemsFilterer(itemRecommendations: ItemRecommendations, store: DataStore):
    ItemFilterer<Item, MatcherContext, AutocompleteContext> {
  const filterContextProvider =
      combineLatest(itemRecommendations.allRecommendations, store.labels.map).pipe(map(results => {
        const recommendationsByItem = results[0]!;
        const labelsMap = results[1]!;

        // Add name to labels map for filtering
        labelsMap.forEach(label => labelsMap.set(label.name, label));

        return (item: Item) => {
          return {
            item,
            labelsMap,
            recommendations: recommendationsByItem.get(item.id) || [],
          };
        };
      }));

  const filterer = new ItemFilterer<Item, MatcherContext, AutocompleteContext>(
      filterContextProvider, tokenizeItem, ItemsFilterMetadata);
  filterer.autocompleteContext = ({items: store.items, labels: store.labels});

  return filterer;
}
