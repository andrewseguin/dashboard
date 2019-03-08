import {Injectable} from '@angular/core';
import {Github} from 'app/service/github';
import {RepoDao} from 'app/service/repo-dao';
import {of} from 'rxjs';
import {mergeMap, take} from 'rxjs/operators';

@Injectable()
export class Updater {
  constructor(private repoDao: RepoDao, private github: Github) {}

  updateLabels(repo: string) {
    this.github.getLabels(repo).subscribe(result => {
      if (result.completed === result.total) {
        this.repoDao.setLabels(result.current);
      }
    });
  }

  updateContributors(repo: string) {
    this.github.getContributors(repo).subscribe(result => {
      if (result.completed === result.total) {
        this.repoDao.setContributors(result.current);
      }
    });
  }

  updateIssues(repoId: string) {
    let lastUpdated = '';
    this.repoDao.repo
        .pipe(
            mergeMap(repo => {
              const items = repo.items;

              items.forEach(issue => {
                if (!lastUpdated || lastUpdated < issue.updated) {
                  lastUpdated = issue.updated;
                }
              });

              return this.github.getItemsCount(repoId, lastUpdated);
            }),
            mergeMap(count => {
              return count ? this.github.getIssues(repoId, lastUpdated) : of(null);
            }),
            take(1))
        .subscribe(result => {
          if (result) {
            this.repoDao.setItems(result.current);
            console.log('Updated', result.current.length, ' since ', lastUpdated);
          }
        });
  }
}
