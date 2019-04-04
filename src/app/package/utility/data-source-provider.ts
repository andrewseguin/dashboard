import {Filterer, FiltererState} from '../data-source/filterer';
import {Grouper, GrouperState} from '../data-source/grouper';
import {Provider} from '../data-source/provider';
import {Sorter, SorterState} from '../data-source/sorter';
import {Viewer, ViewerState} from '../data-source/viewer';

export interface DataSourceProvider {
  id: string;
  label: string;
  viewer: (initialState?: ViewerState) => Viewer<any, any, any>;
  filterer: (initialState?: FiltererState) => Filterer;
  grouper: (initialState?: GrouperState) => Grouper;
  sorter: (initialState?: SorterState) => Sorter;
  provider: () => Provider;
}
