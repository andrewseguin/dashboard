import {Repo} from 'app/repository/services/repo-dao';
import {Recommendation} from '../services/dao/recommendations-dao';
import {ItemFilterer} from '../services/items-renderer/item-filterer';
import {getItemsMatchingFilterAndSearch} from './get-items-matching-filter-and-search';

export function getRecommendations(
    itemId: number, repo: Repo, recommendations: Recommendation[]): Recommendation[] {
  const item = repo.itemsMap.get(itemId);
  return recommendations.filter(recommendation => {
    const filterer = new ItemFilterer(recommendation.filters || [], repo, new Map());
    const matchedIssues = getItemsMatchingFilterAndSearch([item], filterer, recommendation.search);
    return !!matchedIssues.length;
  });
}
