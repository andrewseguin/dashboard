import {Item} from 'app/service/github';
import {tokenizeIssue} from './tokenize-issue';

export function itemMatchesSearch(token: string, issue: Item) {
  const issueStr = tokenizeIssue(issue);
  return issueStr.indexOf(token.toLowerCase()) != -1;
}
