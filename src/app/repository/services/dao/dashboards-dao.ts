import {Injectable} from '@angular/core';
import {Group, ItemRendererOptionsState} from 'app/package/items-renderer/item-renderer-options';
import {RepoIndexedDb} from '../repo-indexed-db';
import {ItemType} from './items-dao';
import {ListDao} from './list-dao';

export interface IssueListDisplayTypeOptions {
  listLength: number;
}

export interface ItemCountDisplayTypeOptions {
  fontSize: 'small'|'normal'|'large';
  colors: {color: 'yellow'|'red'|'green', condition: 'less than'|'greater than'|'equal to'}[];
}

export interface PieChartDisplayTypeOptions {
  group: Group;
  filteredGroups: string;  // Comma deliminated
}

export type DisplayType = 'list'|'count'|'pie';

export type WidgetDisplayTypeOptions =
    IssueListDisplayTypeOptions|ItemCountDisplayTypeOptions|PieChartDisplayTypeOptions;

export interface Widget {
  title: string;
  itemType: ItemType;
  options: ItemRendererOptionsState;
  displayType: DisplayType;
  displayTypeOptions: WidgetDisplayTypeOptions;
}

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
