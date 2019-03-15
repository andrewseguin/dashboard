import {Injectable} from '@angular/core';
import {Group, ItemRendererOptionsState} from 'app/package/items-renderer/item-renderer-options';
import {RepoIndexedDb} from '../repo-indexed-db';
import {ItemType} from './items-dao';
import {ListDao} from './list-dao';

export interface ItemListDisplayTypeOptions {
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

export interface TimeSeriesDisplayTypeOptions {
  start: string;
  end: string;
  group: 'day'|'week'|'month';
  datasets: string|string[];
}

export type DisplayType = 'list'|'count'|'pie'|'time-series';

export type WidgetDisplayTypeOptions = ItemListDisplayTypeOptions|TimeSeriesDisplayTypeOptions|
    ItemCountDisplayTypeOptions|PieChartDisplayTypeOptions;

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
