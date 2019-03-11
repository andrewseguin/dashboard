import {ItemFilterer} from 'app/package/items-renderer/item-filterer';
import {combineLatest} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {Item, LabelsDao} from '../../services/dao';
import {ItemRecommendations} from '../../services/item-recommendations';
import {tokenizeItem} from '../tokenize-item';
import {ItemsFilterMetadata, MatcherContext} from './items-filter-metadata';


export function getItemsFilterer(itemRecommendations: ItemRecommendations, labelsDao: LabelsDao) {
  return combineLatest(itemRecommendations.recommendations, labelsDao.map)
      .pipe(filter(result => !!result[0] && !!result[1]), map(result => {
              const recommendationsByItem = result[0];
              const labelsMap = result[1];
              const contextProvider = (item: Item) => {
                return {
                  item,
                  labelsMap,
                  recommendations: recommendationsByItem.get(item.id),
                };
              };
              return new ItemFilterer<Item, MatcherContext>(
                  contextProvider, tokenizeItem, ItemsFilterMetadata);
            }));
}
