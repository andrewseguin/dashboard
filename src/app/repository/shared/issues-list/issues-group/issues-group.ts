import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Issue} from 'app/service/github';
import {map} from 'rxjs/operators';

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

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  navigateToIssue(issue: number) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute.parent,
      queryParams: {issue},
      queryParamsHandling: 'merge',
    });
  }
}
