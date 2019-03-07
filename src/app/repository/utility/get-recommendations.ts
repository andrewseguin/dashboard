import {Repo} from 'app/service/repo-dao';
import {Recommendation} from '../services/dao/recommendations-dao';
import {IssueFilterer} from '../services/issues-renderer/issue-filterer';
import {getIssuesMatchingFilterAndSearch} from './get-issues-matching-filter-and-search';

export function getRecommendations(
    itemId: number, repo: Repo, recommendations: Recommendation[]): Recommendation[] {
  const issue = repo.itemsMap.get(itemId);
  return recommendations.filter(recommendation => {
    const filterer = new IssueFilterer(recommendation.filters, repo, new Map());
    const matchedIssues =
        getIssuesMatchingFilterAndSearch([issue], filterer, recommendation.search);
    return !!matchedIssues.length;
  });
}
