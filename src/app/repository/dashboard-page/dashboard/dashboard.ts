import {ItemFiltererState} from 'app/package/items-renderer/item-filterer';
import {
  CountDisplayTypeOptions
} from 'app/repository/dashboard-page/dashboard/widget-view/count/count';
import {
  ListDisplayTypeOptions
} from 'app/repository/dashboard-page/dashboard/widget-view/list/list';
import {
  PieChartDisplayTypeOptions
} from 'app/repository/dashboard-page/dashboard/widget-view/pie-chart/pie-chart';
import {
  TimeSeriesDisplayTypeOptions
} from 'app/repository/dashboard-page/dashboard/widget-view/time-series/time-series';
import {ItemType} from '../../services/dao/data/item';

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

export function hasWidgets(dashboard: Dashboard) {
  const columnGroups = dashboard.columnGroups || [];
  return columnGroups.some(columnGroup => {
    return columnGroup.columns.some(column => {
      return column.widgets.some(widget => !!widget);
    });
  });
}
