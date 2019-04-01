import {Item} from 'app/github/app-types/item';
import {Label} from 'app/github/app-types/label';
import {filterItems, searchItems} from 'app/package/items-renderer/item-filterer';
import {ItemsFilterMetadata, MatcherContext} from '../../github/data-source/item-filter-metadata';
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
      // Add name to labels map for filtering
      labelsMap = new Map(labelsMap);  // Do not make changes to the provided map
      labelsMap.forEach(label => labelsMap.set(label.name, label));

      return {
        item,
        labelsMap,
        recommendations: [
        ],  // Recommendations cannot be determined based on recommendations, TODO: or can they be?
      };
    };

    const filters = recommendation.filtererState ? recommendation.filtererState.filters : [];
    const filteredItems =
        filterItems<Item, MatcherContext>([item], filters, contextProvider, ItemsFilterMetadata);

    const search = recommendation.filtererState ? recommendation.filtererState.search : '';
    const searchedItems = searchItems(filteredItems, search, tokenizeItem);

    return !!searchedItems.length;
  });
}
