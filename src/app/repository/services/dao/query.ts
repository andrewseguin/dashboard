import {ItemFiltererState} from 'app/package/items-renderer/item-filterer';
import {ItemGrouperState} from 'app/package/items-renderer/item-grouper';
import {ItemSorterState} from 'app/package/items-renderer/item-sorter';
import {ItemViewerState} from 'app/package/items-renderer/item-viewer';

export interface Query {
  id?: string;
  dbAdded?: string;
  dbModified?: string;
  name?: string;
  type?: 'issue'|'pr';
  group?: string;
  grouperState?: ItemGrouperState<any>;
  filtererState?: ItemFiltererState;
  sorterState?: ItemSorterState<any>;
  viewerState?: ItemViewerState<any>;
}
