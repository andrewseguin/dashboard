import {ChangeDetectionStrategy, Component, Input, ChangeDetectorRef} from '@angular/core';
import {IssuesDao, Issue} from 'app/service/issues-dao';
import {Github} from 'app/service/github';

@Component({
  selector: 'updater',
  templateUrl: 'updater.html',
  styleUrls: ['updater.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Updater {
  issuesToUpdate = 0;

  lastUpdated = '';

  constructor(public github: Github, private issuesDao: IssuesDao, private cd: ChangeDetectorRef) {
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
    this.github.getAllIssues(this.lastUpdated).subscribe(result => {
      if (result.completed === result.total) {
        this.issuesDao.addIssues(result.currentResults);
      }
    })
  }
}
