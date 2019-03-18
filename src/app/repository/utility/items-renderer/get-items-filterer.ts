import {ItemFilterer} from 'app/package/items-renderer/item-filterer';
import {ListDao} from 'app/repository/services/dao/list-dao';
import {combineLatest, Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {Item, Label} from '../../services/dao';
import {ItemRecommendations} from '../../services/item-recommendations';
import {tokenizeItem} from '../tokenize-item';
import {ItemsFilterMetadata, MatcherContext} from './items-filter-metadata';


export function getItemsFilterer(
    itemRecommendations: ItemRecommendations,
    labelsDao: ListDao<Label>): Observable<ItemFilterer<Item, MatcherContext>> {
  return combineLatest(itemRecommendations.allRecommendations, labelsDao.map)
      .pipe(filter(result => result.every(r => !!r)), map(result => {
              const recommendationsByItem = result[0]!;
              const labelsMap = result[1]!;

              // Add name to labels map for filtering
              labelsMap.forEach(label => labelsMap.set(label.name, label));

              const contextProvider = (item: Item) => {
                return {
                  item,
                  labelsMap,
                  recommendations: recommendationsByItem.get(item.id) || [],
                };
              };
              return new ItemFilterer(contextProvider, tokenizeItem, ItemsFilterMetadata);
            }));
}
