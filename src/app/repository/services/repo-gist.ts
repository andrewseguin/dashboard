import {Injectable} from '@angular/core';
import {Config} from 'app/service/config';
import {combineLatest, Subject} from 'rxjs';
import {filter, map, mergeMap, takeUntil} from 'rxjs/operators';
import {ActivatedRepository} from './activated-repository';
import {DashboardsDao} from './dao/dashboards-dao';
import {QueriesDao} from './dao/queries-dao';
import {RecommendationsDao} from './dao/recommendations-dao';

@Injectable()
export class RepoGist {
  private destroyed = new Subject();

  constructor(
      private activatedRepository: ActivatedRepository, private dashboardsDao: DashboardsDao,
      private queriesDao: QueriesDao, private recommendationsDao: RecommendationsDao,
      private config: Config) {
  }

  saveChanges() {
    combineLatest(this.dashboardsDao.list, this.queriesDao.list, this.recommendationsDao.list)
        .pipe(filter(result => result.every(r => !!r)), takeUntil(this.destroyed))
        .subscribe(result => {
          const dashboards = result[0];
          const queries = result[1];
          const recommendations = result[2];

          this.config.saveRepoConfigToGist(
              this.activatedRepository.repository.value, {dashboards, queries, recommendations});
        });
  }

  sync(): Promise<void> {
    return new Promise(resolve => {
      return this.activatedRepository.repository
          .pipe(
              filter(repository => !!repository),
              mergeMap(repository => this.config.getRepoConfig(repository)), map(repoConfig => {
                this.dashboardsDao.sync(repoConfig.dashboards);
                this.queriesDao.sync(repoConfig.queries);
                this.recommendationsDao.sync(repoConfig.recommendations);
              }))
          .subscribe(() => resolve());
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
