import {Injectable} from '@angular/core';
import {Auth} from 'app/service/auth';
import {GithubIssue, Reactions} from 'app/service/github';
import {RepoDao2} from '../repo-dao';
import {ListDao} from './list-dao';

export type ItemType = 'issue'|'pr';

export interface Item {
  id: string;
  assignees: string[];
  body: string;
  title: string;
  comments: number;
  labels: string[];
  number: number;
  state: string;
  reporter: string;
  created: string;
  updated: string;
  reactions: Reactions;
  pr: boolean;
  url: string;
  dbAdded?: string;
  dbModified?: string;
}

export interface PullRequest extends Item {}
export interface Issue extends Item {}

@Injectable()
export class ItemsDao extends ListDao<Item> {
  constructor(auth: Auth, repoDao: RepoDao2) {
    super(auth, repoDao, 'items');
  }
}

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
    updated: o.updated_at,
    reactions: o.reactions,
    pr: !!o.pull_request,
    url: o.html_url,
  };
}
