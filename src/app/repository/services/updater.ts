import {Injectable} from '@angular/core';
import {Github} from 'app/service/github';
import {Observable, of} from 'rxjs';
import {filter, map, mergeMap, take, tap} from 'rxjs/operators';
import {ActivatedRepository} from './activated-repository';
import {ContributorsDao, Item, ItemsDao, LabelsDao} from './dao';
import {RepoDaoType} from './repo-load-state';


export interface StaleIssuesState {
  repository: string;
  lastUpdated: string;
  count: number;
}

@Injectable()
export class Updater {
  lastUpdatedIssueDate =
      this.itemsDao.list.pipe(filter(list => !!list), map(items => {
                                let lastUpdated = '';
                                items!.forEach(item => {
                                  if (!lastUpdated || lastUpdated < item.updated) {
                                    lastUpdated = item.updated;
                                  }
                                });

                                return lastUpdated;
                              }));

  constructor(
      private activatedRepository: ActivatedRepository, private itemsDao: ItemsDao,
      private labelsDao: LabelsDao, private contributorsDao: ContributorsDao,
      private github: Github) {}

  update(type: RepoDaoType): Promise<void> {
    switch (type) {
      case 'items':
        return this.updateIssues();
      case 'labels':
        return this.updateLabels();
      case 'contributors':
        return this.updateContributors();
    }
  }

  private updateLabels(): Promise<void> {
    return new Promise(resolve => {
      this.activatedRepository.repository
          .pipe(
              filter(v => !!v), take(1), mergeMap(repository => this.github.getLabels(repository!)),
              filter(result => result.completed === result.total), take(1))
          .subscribe((result) => {
            this.labelsDao.sync(result.accumulated).then(syncResponse => {
              this.labelsDao.update(syncResponse.toUpdate);
            });
            resolve();
          });
    });
  }

  private updateContributors(): Promise<void> {
    return new Promise(resolve => {
      this.activatedRepository.repository
          .pipe(
              filter(v => !!v), take(1),
              mergeMap(repository => this.github.getContributors(repository!)),
              filter(result => result.completed === result.total), take(1))
          .subscribe((result) => {
            this.contributorsDao.sync(result.accumulated).then(syncResponse => {
              this.contributorsDao.update(syncResponse.toUpdate);
            });
            resolve();
          });
    });
  }

  private updateIssues(): Promise<void> {
    return new Promise(resolve => {
      this.activatedRepository.repository
          .pipe(
              filter(v => !!v), take(1),
              mergeMap(repository => this.getStaleIssuesState(repository!)), mergeMap(state => {
                return state.count ? this.getAllStaleIssues(state.repository!, state.lastUpdated) :
                                     of([]);
              }),
              take(1))
          .subscribe((result) => {
            this.itemsDao.update(result);
            resolve();
          });
    });
  }

  getAllStaleIssues(repository: string, lastUpdated: string): Observable<Item[]> {
    return this.github.getIssues(repository, lastUpdated)
        .pipe(filter(result => !result || result.total === result.completed), map(result => {
                return result ? result.accumulated : [];
              }));
  }

  getStaleIssuesState(repository: string): Observable<StaleIssuesState> {
    let lastUpdated = '';

    return this.lastUpdatedIssueDate.pipe(
        tap(date => lastUpdated = date),
        mergeMap(() => this.github.getItemsCount(repository, lastUpdated)),
        map(count => ({lastUpdated, count, repository})));
  }
}
