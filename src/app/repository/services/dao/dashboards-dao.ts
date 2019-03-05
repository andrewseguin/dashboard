import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {Config} from 'app/service/config';
import {ActivatedRepository} from '../activated-repository';
import {RepositoryCollectionDao} from './repository-collection-dao';

export interface Dashboard {
  id?: string;
  name?: string;
  dateCreated?: string;
  dateModified?: string;
}

@Injectable()
export class DashboardsDao extends RepositoryCollectionDao<Dashboard> {
  constructor(afAuth: AngularFireAuth, activatedRepository: ActivatedRepository, config: Config) {
    super(afAuth, activatedRepository, config, 'dashboards');
  }
}
