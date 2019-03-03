import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {IssuesRenderer} from 'app/repository/services/issues-renderer/issues-renderer';
import {Issue} from 'app/service/github';
import {Subject} from 'rxjs';

@Component({
  selector: 'issue-summary',
  templateUrl: 'issue-summary.html',
  styleUrls: ['issue-summary.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'(click)': 'selectIssue()'}
})
export class IssueSummary implements OnInit {
  private destroyed = new Subject();

  @Input() issue: Issue;

  constructor(
      private activatedRoute: ActivatedRoute,
      public issuesRenderer: IssuesRenderer, private router: Router) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  selectIssue() {
    this.router.navigate(
        [this.issue.number], {relativeTo: this.activatedRoute});
  }
}
