import {Injectable} from '@angular/core';
import {Auth} from 'app/service/auth';
import {GithubContributor} from 'app/service/github';
import {RepoDao2} from '../repo-dao';
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
  constructor(auth: Auth, repoDao: RepoDao2) {
    super(auth, repoDao, 'contributors');
  }
}

export function githubContributorToContributor(o: GithubContributor): Contributor {
  return {login: o.login, id: `${o.id}`, avatar_url: o.avatar_url, contributions: o.contributions};
}
