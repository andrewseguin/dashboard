import {ComponentType} from '@angular/cdk/overlay/index';
import {ItemFiltererState} from 'app/package/items-renderer/item-filterer';
import {WidgetDataOptionsProvider} from './edit-widget/widget-type-options/widget-type-options';

export interface Widget {
  title?: string;
  dataSourceType?: string;
  filtererState?: ItemFiltererState;
  displayType?: string;
  displayTypeOptions?: any;
}

export interface WidgetConfig {
  id: string;
  label: string;
  component: ComponentType<any>;
  optionsProvider: WidgetDataOptionsProvider;
  config?: any;
}
