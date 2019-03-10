import {Injectable} from '@angular/core';
import {Auth} from 'app/service/auth';
import {ItemRendererOptionsState} from '../items-renderer/item-renderer-options';
import {RepoDao2} from '../repo-dao';
import {ListDao} from './list-dao';


export interface Query {
  id?: string;
  name?: string;
  type?: 'issue'|'pr';
  group?: string;
  createdBy?: string;
  modifiedBy?: string;
  season?: string;
  options?: ItemRendererOptionsState;
  dbAdded?: string;
  dbModified?: string;
}

@Injectable()
export class QueriesDao extends ListDao<Query> {
  constructor(auth: Auth, repoDao: RepoDao2) {
    super(auth, repoDao, 'queries');
  }
}
