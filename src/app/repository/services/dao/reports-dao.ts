import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {Config} from 'app/service/config';

import {ActivatedRepository} from '../activated-repository';
import {IssueRendererOptionsState} from '../issues-renderer/issue-renderer-options';

import {RepositoryCollectionDao} from './repository-collection-dao';

export interface Report {
  id?: string;
  name?: string;
  group?: string;
  createdBy?: string;
  modifiedBy?: string;
  season?: string;
  options?: IssueRendererOptionsState;
  dateCreated?: string;
  dateModified?: string;
}

@Injectable()
export class ReportsDao extends RepositoryCollectionDao<Report> {
  constructor(
      afAuth: AngularFireAuth, activatedRepository: ActivatedRepository,
      config: Config) {
    super(afAuth, activatedRepository, config, 'reports');
  }
}
