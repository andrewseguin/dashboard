import {Injectable} from '@angular/core';
import {ItemRendererOptionsState} from 'app/package/items-renderer/item-renderer-options';
import {Auth} from 'app/service/auth';
import {RepoDataStore} from '../repo-data-store';
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
  constructor(auth: Auth, repoDao: RepoDataStore) {
    super(auth, repoDao, 'queries');
  }
}
