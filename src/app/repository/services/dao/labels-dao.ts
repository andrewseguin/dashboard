import {Injectable} from '@angular/core';
import {Auth} from 'app/service/auth';
import {GithubLabel} from 'app/service/github';
import {RepoDataStore} from '../repo-data-store';
import {ListDao} from './list-dao';

export interface Label {
  id: string;
  name: string;
  description: string;
  color: string;
  dbAdded?: string;
  dbModified?: string;
}

@Injectable()
export class LabelsDao extends ListDao<Label> {
  constructor(auth: Auth, repoDao: RepoDataStore) {
    super(auth, repoDao, 'labels');
  }
}

export function githubLabelToLabel(o: GithubLabel): Label {
  return {
    id: `${o.id}`,
    name: o.name,
    description: o.description,
    color: o.color,
  };
}
