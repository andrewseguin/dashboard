import {Repo} from 'app/repository/services/dao/repo-dao';
import {Label} from '../services/dao';
import {Recommendation} from '../services/dao/recommendations-dao';
import {ItemFilterer} from '../services/items-renderer/item-filterer';
import {getItemsMatchingFilterAndSearch} from './get-items-matching-filter-and-search';

export function getRecommendations(
    itemId: string, repo: Repo, recommendations: Recommendation[],
    labelsMap: Map<string, Label>): Recommendation[] {
  const item = repo.itemsMap.get(itemId);
  return recommendations.filter(recommendation => {
    const filterer = new ItemFilterer(recommendation.filters || [], labelsMap, new Map());
    const matchedIssues = getItemsMatchingFilterAndSearch([item], filterer, recommendation.search);
    return !!matchedIssues.length;
  });
}
