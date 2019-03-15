import {Injectable} from '@angular/core';
import {Github} from 'app/service/github';
import {Observable, of} from 'rxjs';
import {filter, map, mergeMap, take, tap} from 'rxjs/operators';
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

  constructor(private dao: Dao, private github: Github) {}

  update(repository: string, type: RepoDaoType): Promise<void> {
    switch (type) {
      case 'items':
        return this.updateIssues(repository);
      case 'labels':
        return this.updateLabels(repository);
      case 'contributors':
        return this.updateContributors(repository);
    }
  }

  private updateLabels(repository: string): Promise<void> {
    const store = this.dao.get(repository);

    return new Promise(resolve => {
      this.github.getLabels(repository)
          .pipe(filter(result => result.completed === result.total), take(1))
          .subscribe((result) => {
            store.labels.sync(result.accumulated).then(syncResponse => {
              store.labels.update(syncResponse.toUpdate);
            });
            resolve();
          });
    });
  }

  private updateContributors(repository: string): Promise<void> {
    const store = this.dao.get(repository);

    return new Promise(resolve => {
      this.github.getContributors(repository!)
          .pipe(filter(result => result.completed === result.total), take(1))
          .subscribe((result) => {
            store.contributors.sync(result.accumulated).then(syncResponse => {
              store.contributors.update(syncResponse.toUpdate);
            });
            resolve();
          });
    });
  }

  private updateIssues(repository: string): Promise<void> {
    const store = this.dao.get(repository);

    return new Promise(resolve => {
      this.getStaleIssuesState(repository!)
          .pipe(
              mergeMap(state => {
                return state.count ? this.getAllStaleIssues(state.repository!, state.lastUpdated) :
                                     of([]);
              }),
              take(1))
          .subscribe((result) => {
            store.items.update(result);
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
