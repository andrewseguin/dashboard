import {Repo} from 'app/service/repo-dao';
import {Recommendation} from '../services/dao/recommendations-dao';
import {IssueFilterer} from '../services/issues-renderer/issue-filterer';
import {getIssuesMatchingFilterAndSearch} from './get-issues-matching-filter-and-search';
import {numberMatchesEquality} from './search/query-matcher';

export function getRecommendations(
    issueId: number, repo: Repo, recommendations: Recommendation[]): Recommendation[] {
  const issue = repo.issuesMap.get(issueId);
  return recommendations.filter(recommendation => {
    const filterer = new IssueFilterer(recommendation.filters, repo, new Map());
    const matchedIssues =
        getIssuesMatchingFilterAndSearch([issue], filterer, recommendation.search);
    return !!matchedIssues.length;
  });
}
