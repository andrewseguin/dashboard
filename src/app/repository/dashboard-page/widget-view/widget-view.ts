import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges
} from '@angular/core';
import {Widget} from 'app/repository/services/dao/dashboards-dao';
import {IssuesRenderer} from 'app/repository/services/issues-renderer/issues-renderer';
import {Issue} from 'app/service/github';
import {Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'widget-view',
  styleUrls: ['widget-view.scss'],
  templateUrl: 'widget-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'theme-background-card theme-border',
  },
  providers: [IssuesRenderer]
})
export class WidgetView {
  @Input() widget: Widget;

  @Input() editMode: boolean;

  @Output() edit = new EventEmitter<void>();

  @Output() remove = new EventEmitter<void>();

  issues: Issue[];

  listLengthLimit = 3;

  trackByNumber = (_i, issue: Issue) => issue.number;

  private destroyed = new Subject();

  constructor(public issuesRenderer: IssuesRenderer, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.issuesRenderer.initialize();
    this.issuesRenderer.issueGroups
        .pipe(filter(issueGroups => !!issueGroups), takeUntil(this.destroyed))
        .subscribe(issueGroups => {
          this.issues = [];
          issueGroups.forEach(issueGroup => this.issues.push(...issueGroup.issues));
          this.cd.markForCheck();
        });
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['widget'] && this.widget) {
      this.issuesRenderer.options.setState(this.widget.options);
    }
  }

  openIssueModal(issue: number) {}
}
