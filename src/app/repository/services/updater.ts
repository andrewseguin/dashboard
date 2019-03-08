import {Injectable} from '@angular/core';
import {Github} from 'app/service/github';
import {RepoDao} from 'app/service/repo-dao';
import {Observable, of} from 'rxjs';
import {filter, map, mergeMap, take, tap} from 'rxjs/operators';


export interface StaleIssuesState {
  lastUpdated: string;
  count: number;
}

@Injectable()
export class Updater {
  lastUpdatedIssueDate =
      this.repoDao.repo.pipe(filter(repo => !!repo), map(repo => {
                               const items = repo.items;

                               let lastUpdated = '';
                               items.forEach(issue => {
                                 if (!lastUpdated || lastUpdated < issue.updated) {
                                   lastUpdated = issue.updated;
                                 }
                               });

                               return lastUpdated;
                             }));

  constructor(private repoDao: RepoDao, private github: Github) {}

  updateLabels(repo: string) {
    return new Promise(resolve => {
      this.github.getLabels(repo).subscribe(result => {
        if (result.completed === result.total) {
          this.repoDao.setLabels(result.current);
          resolve();
        }
      });
    });
  }

  updateContributors(repo: string) {
    return new Promise(resolve => {
      this.github.getContributors(repo).subscribe(result => {
        if (result.completed === result.total) {
          this.repoDao.setContributors(result.current);
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
              this.repoDao.setItems(result.current);
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
