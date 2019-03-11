import {Injectable} from '@angular/core';
import {GithubContributor} from 'app/service/github';
import {RepoIndexedDb} from '../repo-indexed-db';
import {ListDao} from './list-dao';

export interface Contributor {
  login: string;
  id: string;
  avatar_url: string;
  contributions: number;
  dbAdded?: string;
  dbModified?: string;
}

@Injectable()
export class ContributorsDao extends ListDao<Contributor> {
  constructor(repoDao: RepoIndexedDb) {
    super(repoDao, 'contributors');
  }
}

export function githubContributorToContributor(o: GithubContributor): Contributor {
  return {login: o.login, id: `${o.id}`, avatar_url: o.avatar_url, contributions: o.contributions};
}
