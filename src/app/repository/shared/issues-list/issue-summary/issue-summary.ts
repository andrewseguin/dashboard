import {query} from '@angular/animations';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {IssueRecommendations} from 'app/repository/services/issue-recommendations';
import {IssuesRenderer} from 'app/repository/services/issues-renderer/issues-renderer';
import {Issue} from 'app/service/github';
import {Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'issue-summary',
  templateUrl: 'issue-summary.html',
  styleUrls: ['issue-summary.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'(click)': 'selectIssue()'}
})
export class IssueSummary {
  private destroyed = new Subject();

  @Input() issue: Issue;

  active = this.activatedRoute.queryParamMap.pipe(
      map(queryParamMap => +queryParamMap.get('issue') === this.issue.number));

  constructor(
      private activatedRoute: ActivatedRoute, public issueRecommendations: IssueRecommendations,
      private cd: ChangeDetectorRef, public issuesRenderer: IssuesRenderer,
      private router: Router) {
    this.issuesRenderer.options.changed.pipe(takeUntil(this.destroyed))
        .subscribe(() => this.cd.markForCheck());
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  selectIssue() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute.parent,
      queryParams: {issue: this.issue.number},
      queryParamsHandling: 'merge',
    });
  }
}
