import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {Github} from 'app/service/github';
import {IssuesDao} from 'app/service/issues-dao';
import {DB} from 'idb';


@Component({
  styleUrls: ['home-page.scss'],
  templateUrl: 'home-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage {
  constructor(public github: Github, private issuesDao: IssuesDao) {}

  getAllIssues() {
    this.github.getAllIssues().subscribe(result => {
      if (result.completed === result.total) {
        this.issuesDao.addIssues(result.currentResults);
      }
    });
  }
}
