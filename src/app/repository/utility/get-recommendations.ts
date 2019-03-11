import {ItemFilterer} from 'app/package/items-renderer/item-filterer';
import {Repo} from 'app/repository/services/dao/repo-dao';
import {Item, Label} from '../services/dao';
import {Recommendation} from '../services/dao/recommendations-dao';
import {ItemsFilterMetadata} from './items-filter-metadata';
import {MatcherContext} from './search/filter';
import {tokenizeItem} from './tokenize-item';

export function getRecommendations(
    itemId: string, repo: Repo, recommendations: Recommendation[],
    labelsMap: Map<string, Label>): Recommendation[] {
  const item = repo.itemsMap.get(itemId);
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
        filterer.filter([item], recommendation.filters || [], recommendation.search);
    return !!matchedIssues.length;
  });
}
