import {Injectable} from '@angular/core';
import {Github} from 'app/service/github';
import {Observable, of} from 'rxjs';
import {filter, map, mergeMap, take, tap} from 'rxjs/operators';
import {ActivatedRepository} from './activated-repository';
import {Item} from './dao';
import {Dao} from './dao/dao';
import {RepoDaoType} from './repo-load-state';


export interface StaleIssuesState {
  repository: string;
  lastUpdated: string;
  count: number;
}

@Injectable()
export class Updater {
  lastUpdatedIssueDate =
      this.dao.items.list.pipe(filter(list => !!list), map(items => {
                                 let lastUpdated = '';
                                 items!.forEach(item => {
                                   if (!lastUpdated || lastUpdated < item.updated) {
                                     lastUpdated = item.updated;
                                   }
                                 });

                                 return lastUpdated;
                               }));

  constructor(
      private activatedRepository: ActivatedRepository, private dao: Dao, private github: Github) {}

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
            this.dao.labels.sync(result.accumulated).then(syncResponse => {
              this.dao.labels.update(syncResponse.toUpdate);
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
            this.dao.contributors.sync(result.accumulated).then(syncResponse => {
              this.dao.contributors.update(syncResponse.toUpdate);
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
            this.dao.items.update(result);
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
