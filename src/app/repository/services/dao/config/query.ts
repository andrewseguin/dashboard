import {FiltererState} from 'app/package/items-renderer/filterer';
import {GrouperState} from 'app/package/items-renderer/grouper';
import {SorterState} from 'app/package/items-renderer/sorter';
import {ViewerState} from 'app/package/items-renderer/viewer';

export interface Query {
  id?: string;
  dbAdded?: string;
  dbModified?: string;
  name?: string;
  group?: string;
  dataSourceType?: string;
  filtererState?: FiltererState;
  grouperState?: GrouperState<any>;
  sorterState?: SorterState<any>;
  viewerState?: ViewerState<any>;
}
