import {Injectable} from '@angular/core';
import {Filter} from 'app/package/items-renderer/search-utility/filter';
import {RepoIndexedDb} from '../repo-indexed-db';
import {ListDao} from './list-dao';


export interface AddLabelAction {
  labels: string[];
}
export interface AddAssigneeAction {
  assignee: string[];
}

export type Action = AddLabelAction;

export type RecommendationType = 'warning'|'suggestion';

export type ActionType = 'none'|'add-label'|'add-assignee';

export interface Recommendation {
  id?: string;
  message?: string;
  type?: RecommendationType;
  actionType?: ActionType;
  action?: Action;
  filters?: Filter[];
  search?: string;
  dbAdded?: string;
  dbModified?: string;
}

@Injectable()
export class RecommendationsDao extends ListDao<Recommendation> {
  constructor(repoDao: RepoIndexedDb) {
    super(repoDao, 'recommendations');
  }
}
