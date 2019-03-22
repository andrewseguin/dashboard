import {ItemFiltererState} from 'app/package/items-renderer/item-filterer';
import {CountDisplayTypeOptions} from './widget-view/count/count';
import {ListDisplayTypeOptions} from './widget-view/list/list';
import {PieChartDisplayTypeOptions} from './widget-view/pie-chart/pie-chart';
import {TimeSeriesDisplayTypeOptions} from './widget-view/time-series/time-series';

export type DisplayType = 'list'|'count'|'pie'|'timeSeries';

export type WidgetDisplayTypeOptions = ListDisplayTypeOptions<any, any>|
    TimeSeriesDisplayTypeOptions|CountDisplayTypeOptions|PieChartDisplayTypeOptions<any>;

export interface Widget {
  title?: string;
  dataSourceType?: string;
  filtererState?: ItemFiltererState;
  displayType?: DisplayType;
  displayTypeOptions?: WidgetDisplayTypeOptions;
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

export function hasWidgets(dashboard: Dashboard) {
  const columnGroups = dashboard.columnGroups || [];
  return columnGroups.some(columnGroup => {
    return columnGroup.columns.some(column => {
      return column.widgets.some(widget => !!widget);
    });
  });
}
