import { ComponentType } from '@angular/cdk/overlay/index';
import { InjectionToken } from '@angular/core';
import { DataSourceProvider } from 'app/package/utility/data-source-provider';
import { FiltererState } from 'app/package/data-source/filterer';
import { Subject } from 'rxjs';
import { SavedFiltererState } from './edit-widget/edit-widget';

export const WIDGET_DATA = new InjectionToken<any>('WidgetData');

export interface WidgetData<O, C> {
  dataSources: Map<string, DataSourceProvider>;
  options: O;
  config?: C;
}

export const EDIT_WIDGET_DATA = new InjectionToken<any>('EditWidgetData');

export interface EditWidgetData2<O> {
  dataSources: Map<string, DataSourceProvider>;
  options: Subject<O>;
  savedFiltererStates: SavedFiltererState[];
}

export interface Widget {
  title?: string;
  dataSourceType?: string;
  filtererState?: FiltererState;
  displayType?: string;
  displayTypeOptions?: any;
}

export interface WidgetConfig {
  id: string;
  label: string;
  component: ComponentType<any>;
  editComponent: ComponentType<any>;
  config?: any;
}
