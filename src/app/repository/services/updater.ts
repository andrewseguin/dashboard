import {Injectable} from '@angular/core';
import {Github} from 'app/service/github';
import {Observable, of} from 'rxjs';
import {filter, map, mergeMap, take, tap} from 'rxjs/operators';
import {ActivatedRepository} from './activated-repository';
import {ContributorsDao, ItemsDao, LabelsDao} from './dao';


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

  updateLabels() {
    return new Promise(resolve => {
      this.activatedRepository.repository
          .pipe(
              filter(v => !!v), take(1), mergeMap(repository => this.github.getLabels(repository!)),
              filter(result => result.completed === result.total), take(1))
          .subscribe((result) => {
            this.labelsDao.sync(result.accumulated);
            resolve();
          });
    });
  }

  updateContributors() {
    return new Promise(resolve => {
      this.activatedRepository.repository
          .pipe(
              filter(v => !!v), take(1),
              mergeMap(repository => this.github.getContributors(repository!)),
              filter(result => result.completed === result.total), take(1))
          .subscribe((result) => {
            this.contributorsDao.sync(result.accumulated);
            resolve();
          });
    });
  }

  updateIssues() {
    return new Promise(resolve => {
      this.activatedRepository.repository
          .pipe(
              filter(v => !!v), take(1),
              mergeMap(repository => this.getStaleIssuesState(repository!)), mergeMap(state => {
                return state.count ? this.github.getIssues(state.repository, state.lastUpdated) :
                                     of(null);
              }),
              take(1))
          .subscribe((result) => {
            this.itemsDao.update(result!.accumulated);
            resolve();
          });
    });
  }

  getStaleIssuesState(repository: string): Observable<StaleIssuesState> {
    let lastUpdated = '';

    return this.lastUpdatedIssueDate.pipe(
        tap(date => lastUpdated = date),
        mergeMap(() => this.github.getItemsCount(repository, lastUpdated)),
        map(count => ({lastUpdated, count, repository})));
  }
}
