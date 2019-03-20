import {ItemFiltererState} from 'app/package/items-renderer/item-filterer';
import {CountDisplayTypeOptions} from 'app/repository/dashboard-page/widget-view/count/count';
import {ListDisplayTypeOptions} from 'app/repository/dashboard-page/widget-view/list/list';
import {
  PieChartDisplayTypeOptions
} from 'app/repository/dashboard-page/widget-view/pie-chart/pie-chart';
import {
  TimeSeriesDisplayTypeOptions
} from 'app/repository/dashboard-page/widget-view/time-series/time-series';
import {ItemType} from '../data/item';

export type DisplayType = 'list'|'count'|'pie'|'timeSeries';

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
