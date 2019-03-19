import {ItemFiltererState} from 'app/package/items-renderer/item-filterer';
import {ItemGrouperState} from 'app/package/items-renderer/item-grouper';
import {ItemSorterState} from 'app/package/items-renderer/item-sorter';
import {ItemViewerState} from 'app/package/items-renderer/item-viewer';
import {ItemType} from './item';

export interface CountDisplayTypeOptions {
  fontSize: 'small'|'normal'|'large';
}

export interface ListDisplayTypeOptions<S, V> {
  listLength: number;
  sorterState: ItemSorterState<S>;
  viewerState: ItemViewerState<V>;
}

export interface PieChartDisplayTypeOptions<G> {
  grouperState: ItemGrouperState<G>;
  filteredGroupsByTitle: string[];  // Comma deliminated
}

export interface TimeSeriesDisplayTypeOptions {
  start: string;
  end: string;
  group: 'day'|'week'|'month';
  datasets: string|string[];
}

export type DisplayType = 'list'|'count'|'pie'|'time-series';

export type WidgetDisplayTypeOptions = ListDisplayTypeOptions<any, any>|
    TimeSeriesDisplayTypeOptions|CountDisplayTypeOptions|PieChartDisplayTypeOptions<any>;

export interface Widget {
  title: string;
  itemType: ItemType;
  filtererState: ItemFiltererState;
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
