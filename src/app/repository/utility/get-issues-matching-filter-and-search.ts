import {Issue} from 'app/service/github';

import {IssueFilterer} from '../services/issues-renderer/issue-filterer';

import {issueMatchesSearch} from './issue-matches-search';

export function getIssuesMatchingFilterAndSearch(
    issues: Issue[], filterer: IssueFilterer, search: string) {
  let filteredIssues = filterer.filter(issues);
  return !search ? filteredIssues : filteredIssues.filter(issue => {
    const searchTokens = search.split(' OR ');
    return searchTokens.some(
        searchToken => issueMatchesSearch(searchToken, issue));
  });
}