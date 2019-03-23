import {ItemFiltererState} from 'app/package/items-renderer/item-filterer';

export interface Widget {
  title?: string;
  dataSourceType?: string;
  filtererState?: ItemFiltererState;
  displayType?: string;
  displayTypeOptions?: any;
}
