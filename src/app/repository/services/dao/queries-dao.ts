import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {Config} from 'app/service/config';

import {ActivatedRepository} from '../activated-repository';
import {ItemRendererOptionsState} from '../items-renderer/item-renderer-options';

import {RepositoryCollectionDao} from './repository-collection-dao';

export interface Query {
  id?: string;
  name?: string;
  type?: 'issue'|'pr';
  group?: string;
  createdBy?: string;
  modifiedBy?: string;
  season?: string;
  options?: ItemRendererOptionsState;
  dateCreated?: string;
  dateModified?: string;
}

@Injectable()
export class QueriesDao extends RepositoryCollectionDao<Query> {
  constructor(afAuth: AngularFireAuth, activatedRepository: ActivatedRepository, config: Config) {
    super(afAuth, activatedRepository, config, 'queries');
  }
}
