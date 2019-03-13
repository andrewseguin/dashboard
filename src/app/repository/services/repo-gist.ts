import {Injectable} from '@angular/core';
import {Config} from 'app/service/config';
import {combineLatest, of, Subject} from 'rxjs';
import {debounceTime, filter, mergeMap, takeUntil} from 'rxjs/operators';
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
      private config: Config) {}

  saveChanges() {
    combineLatest(
        this.dashboardsDao.list, this.queriesDao.list, this.recommendationsDao.list,
        this.activatedRepository.repository)
        .pipe(
            filter(result => result.every(r => !!r)), debounceTime(2000), takeUntil(this.destroyed))
        .subscribe(result => {
          const dashboards = result[0]!;
          const queries = result[1]!;
          const recommendations = result[2]!;
          const repository = result[3]!;

          this.config.saveRepoConfigToGist(repository, {dashboards, queries, recommendations});
        });
  }

  sync(): Promise<void> {
    return new Promise(resolve => {
      return this.activatedRepository.repository
          .pipe(
              filter(repository => !!repository),
              mergeMap(repository => this.config.getRepoConfig(repository!)),
              mergeMap(repoConfig => {
                if (!repoConfig) {
                  return of(null);
                }

                return Promise.all([
                  this.dashboardsDao.sync(repoConfig.dashboards),
                  this.queriesDao.sync(repoConfig.queries),
                  this.recommendationsDao.sync(repoConfig.recommendations)
                ]);
              }))
          .subscribe(() => resolve());
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
