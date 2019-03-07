import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatDialog} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {Item} from 'app/service/github';
import {isMobile} from 'app/utility/media-matcher';
import {map} from 'rxjs/operators';
import {IssueDetailDialog} from '../../dialog/issue-detail-dialog/issue-detail-dialog';


@Component({
  selector: 'issues-group',
  templateUrl: 'issues-group.html',
  styleUrls: ['issues-group.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuesGroup {
  @Input() issues: Item[];

  @Input() title: string;

  trackByItemNumber = (_i, issue: Item) => issue.number;

  activeIssue =
      this.activatedRoute.queryParamMap.pipe(map(queryParamMap => +queryParamMap.get('issue')));

  constructor(
      private router: Router, private dialog: MatDialog, private activatedRoute: ActivatedRoute) {}

  navigateToItem(item: number) {
    if (!isMobile()) {
      this.router.navigate([], {
        relativeTo: this.activatedRoute.parent,
        queryParams: {item: item},
        queryParamsHandling: 'merge',
      });
    } else {
      this.dialog.open(IssueDetailDialog, {data: {item}});
    }
  }
}
