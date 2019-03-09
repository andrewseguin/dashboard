import {Item} from 'app/service/github';

import {IssueFilterer} from '../services/issues-renderer/issue-filterer';

import {itemMatchesSearch} from './item-matches-search';

export function getItemsMatchingFilterAndSearch(
    issues: Item[], filterer: IssueFilterer, search: string) {
  let filteredIssues = filterer.filter(issues);
  return !search ? filteredIssues : filteredIssues.filter(issue => {
    const searchTokens = search.split(' OR ');
    return searchTokens.some(searchToken => itemMatchesSearch(searchToken, issue));
  });
}
