import { ItemGroupsDataSource } from "./item-groups-data-source";

export type DataSourceFactory = () => ItemGroupsDataSource<any>;
export interface DataSource {
  id: string;
  label: string;
  factory: DataSourceFactory;
}
