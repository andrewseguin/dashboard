import {Injectable} from '@angular/core';
import {combineLatest} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {ContributorsDao} from './contributors-dao';
import {DashboardsDao} from './dashboards-dao';
import {ItemsDao} from './items-dao';
import {LabelsDao} from './labels-dao';
import {QueriesDao} from './queries-dao';
import {RecommendationsDao} from './recommendations-dao';


@Injectable()
export class DaoState {
  isEmpty = combineLatest(
                this.contributorsDao.list, this.dashboardsDao.list, this.itemsDao.list,
                this.labelsDao.list, this.queriesDao.list, this.recommendationsDao.list)
                .pipe(
                    filter(result => result.every(r => !!r)),
                    map(result => result.every(r => r!.length === 0)));

  constructor(
      private contributorsDao: ContributorsDao, private dashboardsDao: DashboardsDao,
      private itemsDao: ItemsDao, private labelsDao: LabelsDao, private queriesDao: QueriesDao,
      private recommendationsDao: RecommendationsDao) {}
}
