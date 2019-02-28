import {ChangeDetectionStrategy, Component, ChangeDetectorRef} from '@angular/core';
import {Issue} from 'app/service/github';
import {RepoDao} from 'app/service/repo-dao';

@Component({
  styleUrls: ['pre-triage-page.scss'],
  templateUrl: 'pre-triage-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreTriagePage {
  preTriageIssues: Issue[] = [];

  constructor(private repoDao: RepoDao, private cd: ChangeDetectorRef) {
    this.repoDao.repo.subscribe(repo => {
      if (!repo) {
        return;
      }
      this.preTriageIssues = repo.issues.filter(issue => {
        return true;
      });

      this.cd.markForCheck();
    });
  }
}
