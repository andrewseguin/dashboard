import {GithubIssue} from 'app/service/github-types/issue';
import {Reactions} from 'app/service/github-types/reactions';

export type ItemType = 'issue'|'pr';

export interface Item {
  id: string;
  assignees: string[];
  body: string;
  title: string;
  comments: number;
  labels: number[];
  number: number;
  state: string;
  reporter: string;
  created: string;
  closed: string;
  updated: string;
  reactions: Reactions;
  pr: boolean;
  url: string;
  dbAdded?: string;
  dbModified?: string;
}

export interface PullRequest extends Item {}
export interface Issue extends Item {}

export function githubIssueToIssue(o: GithubIssue): Item {
  return {
    id: `${o.number}`,
    assignees: o.assignees.map(a => a.login),
    body: o.body,
    title: o.title,
    comments: o.comments,
    labels: o.labels.map(l => l.id),
    number: o.number,
    state: o.state,
    reporter: o.user.login,
    created: o.created_at,
    closed: o.closed_at,
    updated: o.updated_at,
    reactions: o.reactions,
    pr: !!o.pull_request,
    url: o.html_url,
  };
}
