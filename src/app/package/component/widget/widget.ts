import {ComponentType} from '@angular/cdk/overlay/index';
import {InjectionToken} from '@angular/core';
import {Subject} from 'rxjs';
import {SavedFiltererState} from './edit-widget/edit-widget';

export const WIDGET_DATA = new InjectionToken<any>('WidgetData');

export interface WidgetData<T, C> {
  options: T;
  config: C;
}

export const EDIT_WIDGET_DATA = new InjectionToken<any>('EditWidgetData');

export interface EditWidgetData<T, C> {
  options: Subject<T>;
  savedFiltererStates: SavedFiltererState[];
  config: C;
}

export interface Widget {
  title?: string;
  displayType?: string;
  displayTypeOptions?: any;
}

export interface WidgetConfig {
  id: string;
  label: string;
  component: ComponentType<any>;
  editComponent: ComponentType<any>;
  config: any;
}
