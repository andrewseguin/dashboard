import {ItemFiltererState} from 'app/package/items-renderer/filterer';
import {ItemGrouperState} from 'app/package/items-renderer/grouper';
import {ItemSorterState} from 'app/package/items-renderer/sorter';
import {ItemViewerState} from 'app/package/items-renderer/viewer';

export interface Query {
  id?: string;
  dbAdded?: string;
  dbModified?: string;
  name?: string;
  group?: string;
  dataSourceType?: string;
  filtererState?: ItemFiltererState;
  grouperState?: ItemGrouperState<any>;
  sorterState?: ItemSorterState<any>;
  viewerState?: ItemViewerState<any>;
}
