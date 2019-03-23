import {ItemGroupsDataSource} from './item-groups-data-source';

export type DataSourceFactory = () => ItemGroupsDataSource<any>;
export interface DataSourceProvider {
  id: string;
  label: string;
  factory: DataSourceFactory;
}
