import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {Config} from 'app/service/config';

import {ActivatedRepository} from '../activated-repository';
import {IssueRendererOptionsState} from '../issues-renderer/issue-renderer-options';

import {RepositoryCollectionDao} from './repository-collection-dao';

export interface IssueQueryWidget {
  title: string;
  options: IssueRendererOptionsState;
}

export type Widget = IssueQueryWidget;

export interface Column {
  widgets: Widget[];
}

export interface ColumnGroup {
  columns: Column[];
}

export interface Dashboard {
  id?: string;
  name?: string;
  columnGroups?: ColumnGroup[];
  dateCreated?: string;
  dateModified?: string;
}

@Injectable()
export class DashboardsDao extends RepositoryCollectionDao<Dashboard> {
  constructor(afAuth: AngularFireAuth, activatedRepository: ActivatedRepository, config: Config) {
    super(afAuth, activatedRepository, config, 'dashboards');
  }
}
