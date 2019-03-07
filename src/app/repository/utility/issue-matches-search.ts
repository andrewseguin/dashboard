import {Item} from 'app/service/github';
import {Repo} from 'app/service/repo-dao';
import {tokenizeIssue} from './tokenize-issue';

export function issueMatchesSearch(token: string, issue: Item) {
  const issueStr = tokenizeIssue(issue);
  return issueStr.indexOf(token.toLowerCase()) != -1;
}
