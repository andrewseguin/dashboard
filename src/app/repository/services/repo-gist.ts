import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material';
import {Config} from 'app/service/config';
import {combineLatest, of, Subject} from 'rxjs';
import {debounceTime, filter, mergeMap, take, takeUntil} from 'rxjs/operators';
import {ConfirmConfigUpdates} from '../shared/dialog/confirm-config-updates/confirm-config-updates';
import {ActiveRepo} from './active-repo';
import {Dao} from './dao/dao';
import {SyncResponse} from './dao/list-dao';

@Injectable()
export class RepoGist {
  private destroyed = new Subject();

  constructor(
      private activeRepo: ActiveRepo, private dao: Dao, private config: Config,
      private dialog: MatDialog) {}

  saveChanges() {
    combineLatest(
        this.dao.dashboards.list, this.dao.queries.list, this.dao.recommendations.list,
        this.activeRepo.repository)
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
      return this.activeRepo.repository
          .pipe(
              filter(repository => !!repository),
              mergeMap(repository => this.config.getRepoConfig(repository!)),
              mergeMap(repoConfig => {
                if (!repoConfig) {
                  return of(null);
                }

                return Promise.all([
                  this.dao.dashboards.sync(repoConfig.dashboards),
                  this.dao.queries.sync(repoConfig.queries),
                  this.dao.recommendations.sync(repoConfig.recommendations)
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
                      this.dao.dashboards.add(data.dashboards.toAdd);
                      this.dao.dashboards.update(data.dashboards.toUpdate);
                      this.dao.dashboards.remove(data.dashboards.toRemove.map(v => v.id!));

                      this.dao.queries.add(data.queries.toAdd);
                      this.dao.queries.update(data.queries.toUpdate);
                      this.dao.queries.remove(data.queries.toRemove.map(v => v.id!));

                      this.dao.recommendations.add(data.recommendations.toAdd);
                      this.dao.recommendations.update(data.recommendations.toUpdate);
                      this.dao.recommendations.remove(
                          data.recommendations.toRemove.map(v => v.id!));
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
