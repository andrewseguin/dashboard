import {filterItems, searchItems} from 'app/package/items-renderer/item-filterer';
import {Item, Label} from '../services/dao';
import {Recommendation} from '../services/dao/config/recommendation';
import {ItemsFilterMetadata, MatcherContext} from './items-renderer/item-filter-metadata';
import {tokenizeItem} from './tokenize-item';

export function getRecommendations(
    itemId: string, itemsMap: Map<string, Item>, recommendations: Recommendation[],
    labelsMap: Map<string, Label>): Recommendation[] {
  const item = itemsMap.get(itemId);
  if (!item) {
    return [];
  }

  return recommendations.filter(recommendation => {
    const contextProvider = (item: Item) => {
      // Add name to labels map for filtering
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
