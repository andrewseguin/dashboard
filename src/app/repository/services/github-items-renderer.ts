import {ItemFilterer} from 'app/package/items-renderer/item-filterer';
import {ItemGrouper} from 'app/package/items-renderer/item-grouping';
import {Group} from 'app/package/items-renderer/item-renderer-options';
import {ItemSorter} from 'app/package/items-renderer/item-sorter';
import {ItemsRenderer} from 'app/package/items-renderer/items-renderer';
import {combineLatest, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {
  AutocompleteContext,
  ItemsFilterMetadata,
  MatcherContext
} from '../utility/items-renderer/item-filter-metadata';
import {
  GithubItemGroupingMetadata,
  TitleTransformContext
} from '../utility/items-renderer/item-grouper-metadata';
import {GithubItemSortingMetadata} from '../utility/items-renderer/item-sorter-metadata';
import {tokenizeItem} from '../utility/tokenize-item';
import {ActiveRepo} from './active-repo';
import {Item, ItemType, Label} from './dao';
import {RepoStore} from './dao/dao';
import {ListDao} from './dao/list-dao';
import {ItemRecommendations} from './item-recommendations';

export class GithubItemsRenderer extends ItemsRenderer<Item> {
  constructor(private itemRecommendations: ItemRecommendations, private activeRepo: ActiveRepo) {
    super();

    const store = this.activeRepo.activeStore;

    this.filterer = getItemsFilterer(this.itemRecommendations, store);
    this.grouper = getItemsGrouper(store.labels);
    this.sorter = new ItemSorter(of(null), GithubItemSortingMetadata);
  }
}

function getItemsGrouper(labelsDao: ListDao<Label>):
    ItemGrouper<Item, Group, TitleTransformContext> {
  const titleTransformContextProvider =
      labelsDao.map.pipe(map(labelsMap => ({labelsMap: labelsMap})));

  const grouper = new ItemGrouper<Item, Group, TitleTransformContext>(
      titleTransformContextProvider, GithubItemGroupingMetadata);
  grouper.group = 'all';
  return grouper;
}


export function getItemsList(store: RepoStore, type: ItemType) {
  return combineLatest(store.items.list).pipe(map(results => {
    const items = results[0];

    const issues = items.filter(item => !item.pr);
    const pullRequests = items.filter(item => !!item.pr);
    return type === 'issue' ? issues : pullRequests;
  }));
}

export function getItemsFilterer(itemRecommendations: ItemRecommendations, store: RepoStore):
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
