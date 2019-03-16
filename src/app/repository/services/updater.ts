import {Injectable} from '@angular/core';
import {Github} from 'app/service/github';
import {Observable, of} from 'rxjs';
import {filter, map, mergeMap, take, tap} from 'rxjs/operators';
import {Contributor, Item, Label} from './dao';
import {Dao, RepoDaoType} from './dao/dao';
import {ListDao} from './dao/list-dao';

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
    const store = this.dao.get(repository);

    switch (type) {
      case 'items':
        return this.updateIssues(repository, store.items);
      case 'labels':
        return this.updateLabels(repository, store.labels);
      case 'contributors':
        return this.updateContributors(repository, store.contributors);
    }
  }

  private updateLabels(repository: string, labelsDao: ListDao<Label>): Promise<void> {
    return new Promise(resolve => {
      this.github.getLabels(repository)
          .pipe(filter(result => result.completed === result.total), take(1))
          .subscribe((result) => {
            labelsDao.compare(result.accumulated).then(syncResponse => {
              labelsDao.update(syncResponse.toUpdate);
            });
            resolve();
          });
    });
  }

  private updateContributors(repository: string, contributorsDao: ListDao<Contributor>):
      Promise<void> {
    return new Promise(resolve => {
      this.github.getContributors(repository!)
          .pipe(filter(result => result.completed === result.total), take(1))
          .subscribe((result) => {
            contributorsDao.compare(result.accumulated).then(syncResponse => {
              contributorsDao.update(syncResponse.toUpdate);
            });
            resolve();
          });
    });
  }

  private updateIssues(repository: string, itemsDao: ListDao<Item>): Promise<void> {
    return new Promise(resolve => {
      this.getStaleIssuesState(repository!)
          .pipe(
              mergeMap(state => {
                return state.count ? this.getAllStaleIssues(state.repository!, state.lastUpdated) :
                                     of([]);
              }),
              take(1))
          .subscribe((result) => {
            itemsDao.update(result);
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
