import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material';
import {Config} from 'app/service/config';
import {combineLatest, of, Subject} from 'rxjs';
import {debounceTime, filter, mergeMap, take, takeUntil} from 'rxjs/operators';
import {ConfirmConfigUpdates} from '../shared/dialog/confirm-config-updates/confirm-config-updates';
import {ActivatedRepository} from './activated-repository';
import {DashboardsDao} from './dao/dashboards-dao';
import {SyncResponse} from './dao/list-dao';
import {QueriesDao} from './dao/queries-dao';
import {RecommendationsDao} from './dao/recommendations-dao';

@Injectable()
export class RepoGist {
  private destroyed = new Subject();

  constructor(
      private activatedRepository: ActivatedRepository, private dashboardsDao: DashboardsDao,
      private queriesDao: QueriesDao, private recommendationsDao: RecommendationsDao,
      private config: Config, private dialog: MatDialog) {}

  saveChanges() {
    combineLatest(
        this.dashboardsDao.list, this.queriesDao.list, this.recommendationsDao.list,
        this.activatedRepository.repository)
        .pipe(
            filter(result => result.every(r => !!r)), debounceTime(500), takeUntil(this.destroyed))
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
          .subscribe((syncResults) => {
            if (syncResults && syncResults.some(hasSyncChanges)) {
              const data = {
                dashboards: syncResults[0],
                queries: syncResults[1],
                recommendations: syncResults[2],
              };
              this.dialog.open(ConfirmConfigUpdates, {width: '400px', data})
                  .afterClosed()
                  .pipe(take(1))
                  .subscribe((confirm) => {
                    if (confirm) {
                      this.dashboardsDao.add(data.dashboards.toAdd);
                      this.dashboardsDao.update(data.dashboards.toUpdate);
                      this.dashboardsDao.remove(data.dashboards.toRemove.map(v => v.id!));

                      this.queriesDao.add(data.queries.toAdd);
                      this.queriesDao.update(data.queries.toUpdate);
                      this.queriesDao.remove(data.queries.toRemove.map(v => v.id!));

                      this.recommendationsDao.add(data.recommendations.toAdd);
                      this.recommendationsDao.update(data.recommendations.toUpdate);
                      this.recommendationsDao.remove(data.recommendations.toRemove.map(v => v.id!));
                    }

                    resolve();
                  });
            } else {
              resolve();
            }
          });
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}

function hasSyncChanges(syncResponse: SyncResponse<any>): boolean {
  return syncResponse &&
      (!!syncResponse.toAdd.length || !!syncResponse.toRemove.length ||
       !!syncResponse.toUpdate.length);
}
