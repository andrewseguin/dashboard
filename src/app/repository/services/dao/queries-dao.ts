import {ItemRendererOptionsState} from 'app/package/items-renderer/item-renderer-options';


export interface Query {
  id?: string;
  name?: string;
  type?: 'issue'|'pr';
  group?: string;
  createdBy?: string;
  modifiedBy?: string;
  season?: string;
  options?: ItemRendererOptionsState;
  dbAdded?: string;
  dbModified?: string;
}
