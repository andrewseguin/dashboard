import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Issue} from 'app/service/github';
import {RepoDao} from 'app/service/repo-dao';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  styleUrls: ['pre-triage-page.scss'],
  templateUrl: 'pre-triage-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreTriagePage {
  issues: Observable<Issue[]> = this.repoDao.repo.pipe(map(repo => {
    if (repo) {
      return repo.issues.filter(issue => !issue.pr)
          .sort((a, b) => a.created < b.created ? 1 : -1);
    }
  }));

  selectedIssue = null;

  trackByNumber = (_i, issue: Issue) => issue.number;

  constructor(private repoDao: RepoDao) {}
}
