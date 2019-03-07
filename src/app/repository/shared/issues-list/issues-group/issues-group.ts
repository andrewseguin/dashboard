import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {MatDialog} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {Issue} from 'app/service/github';
import {isMobile} from 'app/utility/media-matcher';
import {map} from 'rxjs/operators';

import {IssueDetailDialog} from '../../dialog/issue-detail-dialog/issue-detail-dialog';
import {IssueQueryDialog} from '../../dialog/issue-query/issue-query-dialog';

@Component({
  selector: 'issues-group',
  templateUrl: 'issues-group.html',
  styleUrls: ['issues-group.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuesGroup {
  @Input() issues: Issue[];

  @Input() title: string;

  trackByIssueNumber = (_i, issue: Issue) => issue.number;

  activeIssue =
      this.activatedRoute.queryParamMap.pipe(map(queryParamMap => +queryParamMap.get('issue')));

  constructor(
      private router: Router, private dialog: MatDialog, private activatedRoute: ActivatedRoute) {}

  navigateToIssue(issueId: number) {
    if (!isMobile()) {
      this.router.navigate([], {
        relativeTo: this.activatedRoute.parent,
        queryParams: {issue: issueId},
        queryParamsHandling: 'merge',
      });
    } else {
      this.dialog.open(IssueDetailDialog, {data: {issueId}});
    }
  }
}
