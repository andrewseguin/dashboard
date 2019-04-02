import {ItemGroupsDataSource} from '../data-source/data-source';

export type DataSourceFactory = () => ItemGroupsDataSource<any>;
export interface DataSourceProvider {
  id: string;
  label: string;
  factory: DataSourceFactory;
}
