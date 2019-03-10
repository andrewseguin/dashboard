import {Injectable} from '@angular/core';
import {Filter} from 'app/repository/utility/search/filter';
import {Auth} from 'app/service/auth';
import {RepoDao} from '../repo-dao';
import {ListDao} from './list-dao';


export interface AddLabelAction {
  labels: string[];
}
export interface AddAssigneeAction {
  assignee: string[];
}

export type Action = AddLabelAction;

export type RecommendationType = 'warning'|'suggestion';

export type ActionType = 'add-label'|'add-assignee';

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
  constructor(auth: Auth, repoDao: RepoDao) {
    super(auth, repoDao, 'recommendations');
  }
}
