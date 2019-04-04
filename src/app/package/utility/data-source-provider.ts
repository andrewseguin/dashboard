import {DataSource} from '../data-source/data-source';
import {Filterer} from '../data-source/filterer';
import {Grouper} from '../data-source/grouper';
import {Provider} from '../data-source/provider';
import {Sorter} from '../data-source/sorter';
import {Viewer} from '../data-source/viewer';

export type DataSourceFactory = () => DataSource<any>;
export interface DataSourceProvider {
  id: string;
  label: string;
  factory: DataSourceFactory;
  viewer: () => Viewer<any, any, any>;
  filterer: () => Filterer;
  grouper: () => Grouper;
  sorter: () => Sorter;
  provider: () => Provider;
}
