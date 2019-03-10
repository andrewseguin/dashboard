import {Injectable} from '@angular/core';
import {Github} from 'app/service/github';
import {Observable, of} from 'rxjs';
import {filter, map, mergeMap, take, tap} from 'rxjs/operators';
import {ContributorsDao, ItemsDao, LabelsDao} from './dao';
import {RepoDao2} from './repo-dao';


export interface StaleIssuesState {
  lastUpdated: string;
  count: number;
}

@Injectable()
export class Updater {
  lastUpdatedIssueDate =
      this.itemsDao.list.pipe(filter(list => !!list), map(items => {
                                let lastUpdated = '';
                                items.forEach(item => {
                                  if (!lastUpdated || lastUpdated < item.updated) {
                                    lastUpdated = item.updated;
                                  }
                                });

                                return lastUpdated;
                              }));

  constructor(
      private repoDao: RepoDao2, private itemsDao: ItemsDao, private labelsDao: LabelsDao,
      private contributorsDao: ContributorsDao, private github: Github) {}

  updateLabels(repo: string) {
    return new Promise(resolve => {
      this.github.getLabels(repo).subscribe(result => {
        if (result.completed === result.total) {
          this.labelsDao.updateBulk(result.current);
          resolve();
        }
      });
    });
  }

  updateContributors(repo: string) {
    return new Promise(resolve => {
      this.github.getContributors(repo).subscribe(result => {
        if (result.completed === result.total) {
          this.contributorsDao.updateBulk(result.current);
          resolve();
        }
      });
    });
  }

  updateIssues(repository: string) {
    return new Promise(resolve => {
      this.getStaleIssuesState(repository)
          .pipe(
              mergeMap(state => {
                return state.count ? this.github.getIssues(repository, state.lastUpdated) :
                                     of(null);
              }),
              take(1))
          .subscribe(result => {
            if (result) {
              this.itemsDao.updateBulk(result.current);
            }

            resolve();
          });
    });
  }

  getStaleIssuesState(repository: string): Observable<StaleIssuesState> {
    let lastUpdated = '';

    return this.lastUpdatedIssueDate.pipe(
        tap(date => lastUpdated = date),
        mergeMap(() => this.github.getItemsCount(repository, lastUpdated)),
        map(count => ({lastUpdated, count})));
  }
}
