import {Injectable} from '@angular/core';
import {Auth} from 'app/service/auth';
import {ItemType} from 'app/service/github';
import {ItemRendererOptionsState} from '../items-renderer/item-renderer-options';
import {RepoDao} from '../repo-dao';
import {RepositoryCollectionDao} from './repository-collection-dao';


export interface BaseWidget {
  title?: string;
  itemType: ItemType;
  displayType?: 'list'|'count';
}

export interface IssueListWidget extends BaseWidget {
  options?: ItemRendererOptionsState;
  listLength?: number;
}

export interface ItemCountWidget extends BaseWidget {
  options?: ItemRendererOptionsState;
  fontSize?: number;
  colors?: {color: 'yellow'|'red'|'green', condition: 'less than'|'greater than'|'equal to'}[];
}

export type Widget = IssueListWidget&ItemCountWidget;

export interface Column {
  widgets: Widget[];
}

export interface ColumnGroup {
  columns: Column[];
}

export interface Dashboard {
  id?: string;
  name?: string;
  description?: string;
  columnGroups?: ColumnGroup[];
  dateCreated?: string;
  dateModified?: string;
}

@Injectable()
export class DashboardsDao extends RepositoryCollectionDao<Dashboard> {
  constructor(auth: Auth, repoDao: RepoDao) {
    super(auth, repoDao, 'dashboards');
  }
}
