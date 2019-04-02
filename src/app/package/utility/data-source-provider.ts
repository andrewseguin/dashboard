import {DataSource} from '../data-source/data-source';

export type DataSourceFactory = () => DataSource<any>;
export interface DataSourceProvider {
  id: string;
  label: string;
  factory: DataSourceFactory;
}
