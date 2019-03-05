import {Repo} from 'app/service/repo-dao';
import {Recommendation} from '../services/dao/recommendations-dao';
import {IssueFilterer} from '../services/issues-renderer/issue-filterer';
import {issueMatchesSearch} from './issue-matches-search';

export function getRecommendations(
    issueId, repo: Repo, recommendations: Recommendation[]): Recommendation[] {
  const issue = repo.issuesMap.get(issueId);
  return recommendations.filter(recommendation => {
    const issueFilterer = new IssueFilterer(recommendation.filters, repo);
    const passesFilter = !!issueFilterer.filter([issue]).length;
    if (!passesFilter) {
      return false;
    }

    return issueMatchesSearch(recommendation.search, issue);
  });
}
