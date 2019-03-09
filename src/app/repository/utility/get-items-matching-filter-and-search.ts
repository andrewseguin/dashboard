import {Item} from 'app/service/github';

import {ItemFilterer} from '../services/items-renderer/item-filterer';

import {itemMatchesSearch} from './item-matches-search';

export function getItemsMatchingFilterAndSearch(
    issues: Item[], filterer: ItemFilterer, search: string) {
  let filteredIssues = filterer.filter(issues);
  return !search ? filteredIssues : filteredIssues.filter(issue => {
    const searchTokens = search.split(' OR ');
    return searchTokens.some(searchToken => itemMatchesSearch(searchToken, issue));
  });
}
