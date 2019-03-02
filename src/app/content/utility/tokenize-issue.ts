import {Issue} from "app/service/github";

/**
 * Returns a lower-cased string that contains the searchable tokens of Issue.
 * TODO: Fill in more info, including labels
 */
export function tokenizeIssue(issue: Issue) {
  const issueStr =
      (issue.title || '') + (issue.body || '') + (issue.reporter || '');
  return issueStr.toLowerCase();
}
