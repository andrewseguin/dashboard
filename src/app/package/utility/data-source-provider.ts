import {DataSource} from '../data-source/data-source';
import {Filterer} from '../data-source/filterer';
import {Viewer} from '../data-source/viewer';
import { Grouper } from '../data-source/grouper';

export type DataSourceFactory = () => DataSource<any>;
export interface DataSourceProvider {
  id: string;
  label: string;
  factory: DataSourceFactory;
  viewer: () => Viewer<any, any, any>;
  filterer: () => Filterer;
  grouper: () => Grouper;
}
