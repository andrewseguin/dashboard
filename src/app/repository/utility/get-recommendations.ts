import {Item} from 'app/github/app-types/item';
import {Label} from 'app/github/app-types/label';
import {filterItems, searchItems} from 'app/package/data-source/filterer';
import {ItemsFilterMetadata} from '../../github/data-source/item-filter-metadata';
import {tokenizeItem} from '../../github/utility/tokenize-item';
import {Recommendation} from '../services/dao/config/recommendation';

export function getRecommendations(
    item: Item, recommendations: Recommendation[],
    labelsMap: Map<string, Label>): Recommendation[] {
  if (!item) {
    return [];
  }

  return recommendations.filter(recommendation => {
    const contextProvider = (item: Item) => {
      return {
        item,
        labelsMap,
        recommendations: [],
      };
    };

    const filters = recommendation.filtererState ? recommendation.filtererState.filters : [];
    const filteredItems = filterItems([item], filters, contextProvider, ItemsFilterMetadata);

    const search = recommendation.filtererState ? recommendation.filtererState.search : '';
    const searchedItems = searchItems(filteredItems, search, tokenizeItem);

    return !!searchedItems.length;
  });
}
