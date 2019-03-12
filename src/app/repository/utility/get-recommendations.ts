import {ItemFilterer} from 'app/package/items-renderer/item-filterer';
import {Item, Label} from '../services/dao';
import {Recommendation} from '../services/dao/recommendations-dao';
import {ItemsFilterMetadata, MatcherContext} from './items-renderer/items-filter-metadata';
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
      return {
        item,
        labelsMap,
        recommendations: [
        ],  // Recommendations cannot be determined based on recommendations, TODO: or can they be?
      };
    };
    const filterer =
        new ItemFilterer<Item, MatcherContext>(contextProvider, tokenizeItem, ItemsFilterMetadata);
    const matchedIssues =
        filterer.filter([item], recommendation.filters || [], recommendation.search || '');
    return !!matchedIssues.length;
  });
}
