import {Injectable} from '@angular/core';
import {Config} from 'app/service/config';
import {combineLatest, Subject} from 'rxjs';
import {filter, mergeMap, takeUntil} from 'rxjs/operators';
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
    // Wait to save until sync has happened
    this.sync();
    this.save();
  }

  save() {
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

  sync() {
    this.activatedRepository.repository.pipe(
        filter(repository => !!repository),
        mergeMap(repository => this.config.getRepoConfig(repository)));
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
