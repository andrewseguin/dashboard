import {query} from '@angular/animations';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {IssueRecommendations} from 'app/repository/services/issue-recommendations';
import {IssuesRenderer} from 'app/repository/services/issues-renderer/issues-renderer';
import {Item} from 'app/service/github';
import {Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'issue-summary',
  templateUrl: 'issue-summary.html',
  styleUrls: ['issue-summary.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'(click)': 'select.emit(this.issue.number)'}
})
export class IssueSummary {
  warnings = this.issueRecommendations.recommendations.pipe(
      map(map => this.issue ? map.get(this.issue.number).filter(r => r.type === 'warning') : null));
  suggestions = this.issueRecommendations.recommendations.pipe(map(
      map => this.issue ? map.get(this.issue.number).filter(r => r.type === 'suggestion') : null));

  private destroyed = new Subject();

  @Input() issue: Item;

  @Input() active: boolean;

  @Output()
  select = new EventEmitter<number>()

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
}
