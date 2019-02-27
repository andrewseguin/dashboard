import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {Github} from 'app/service/github';
import {Issue, IssuesDao} from 'app/service/issues-dao';

@Component({
  selector: 'updater',
  templateUrl: 'updater.html',
  styleUrls: ['updater.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Updater {
  issuesToUpdate = 0;

  lastUpdated = '';

  status: 'updating'|'storing'|'' = '';

  loadState: {completed: number, total: number} = {completed: 0, total: 0};

  constructor(
      public github: Github, private issuesDao: IssuesDao,
      private cd: ChangeDetectorRef) {
    // TODO: check every minute or so
    this.issuesDao.issues.subscribe(issues => {
      if (!issues) {
        return;
      }

      this.lastUpdated = '';
      issues.forEach(issue => {
        if (!this.lastUpdated || this.lastUpdated < issue.updated) {
          this.lastUpdated = issue.updated;
        }
      });

      this.github.getOutdatedIssuesCount(this.lastUpdated).subscribe(result => {
        this.issuesToUpdate = result;
        this.cd.markForCheck();
      });
    });
  }

  getAllIssues() {
    this.status = 'updating';
    this.github.getIssues(this.lastUpdated).subscribe(result => {
      this.loadState = {completed: result.completed, total: result.total};
      this.cd.markForCheck();

      if (result.completed === result.total) {
        this.issuesDao.addIssues(result.current).then(() => {
          this.status = 'storing';
          this.cd.markForCheck();
        });
      }
    })
  }
}
