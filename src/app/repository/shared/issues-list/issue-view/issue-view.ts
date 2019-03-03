import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Issue} from 'app/service/github';
import {Subject} from 'rxjs';
import {IssuesRenderer} from 'app/repository/services/issues-renderer/issues-renderer';

@Component({
  selector: 'issue',
  templateUrl: 'issue-view.html',
  styleUrls: ['issue-view.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'(click)': 'selectIssue()'}
})
export class IssueView implements OnInit {
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
