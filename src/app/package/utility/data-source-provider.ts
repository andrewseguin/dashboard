import {DataSource} from '../data-source/data-source';
import { Viewer } from '../data-source/viewer';
import { Filterer } from '../data-source/filterer';

export type DataSourceFactory = () => DataSource<any>;
export interface DataSourceProvider {
  id: string;
  label: string;
  factory: DataSourceFactory;
  viewer: () => Viewer<any, any, any>;
  filterer: () => Filterer;
}
