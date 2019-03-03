import {Issue} from 'app/service/github';
import {Repo} from 'app/service/repo-dao';
import {tokenizeIssue} from './tokenize-issue';

/**
 * Returns the list of issues that contain the search string.
 */
export function getIssuesMatchingSearch(
    items: Issue[], repo: Repo, search: string): Issue[] {
  const tokens = search.split(' ');
  return items.filter(item => {
    return tokens.every(token => {
      return tokenizeIssue(item).indexOf(token.toLowerCase()) != -1;
    });
  });
}
