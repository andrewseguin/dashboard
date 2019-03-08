import {Item} from 'app/service/github';

/**
 * Returns a lower-cased string that contains the searchable tokens of Issue.
 * TODO: Fill in more info, including labels
 */
export function tokenizeIssue(issue: Item) {
  const title = issue.title || '';
  const body = issue.body || '';
  const reporter = issue.reporter || '';
  const issueNumber = issue.number || '';
  const issueStr = title + body + reporter + issueNumber;
  return issueStr.toLowerCase();
}
