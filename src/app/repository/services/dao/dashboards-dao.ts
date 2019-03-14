import {Injectable} from '@angular/core';
import {Group, ItemRendererOptionsState} from 'app/package/items-renderer/item-renderer-options';
import {RepoIndexedDb} from '../repo-indexed-db';
import {ItemType} from './items-dao';
import {ListDao} from './list-dao';


export interface BaseWidget {
  title?: string;
  itemType: ItemType;
  displayType?: 'list'|'count'|'pie';
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

export interface PieChartWidget extends BaseWidget {
  options?: ItemRendererOptionsState;
  groupBy?: Group;
}

export type Widget = IssueListWidget&ItemCountWidget&PieChartWidget;

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
  dbAdded?: string;
  dbModified?: string;
}

@Injectable()
export class DashboardsDao extends ListDao<Dashboard> {
  constructor(repoIndexedDB: RepoIndexedDb) {
    super(repoIndexedDB, 'dashboards');
  }
}
