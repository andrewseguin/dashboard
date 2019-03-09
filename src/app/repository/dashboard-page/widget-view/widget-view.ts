import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges
} from '@angular/core';
import {MatDialog} from '@angular/material';
import {Router} from '@angular/router';
import {ActivatedRepository} from 'app/repository/services/activated-repository';
import {Widget} from 'app/repository/services/dao/dashboards-dao';
import {ItemsRenderer} from 'app/repository/services/issues-renderer/items-renderer';
import {
  IssueDetailDialog
} from 'app/repository/shared/dialog/issue-detail-dialog/issue-detail-dialog';
import {Item} from 'app/service/github';
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
  providers: [ItemsRenderer]
})
export class WidgetView {
  @Input() widget: Widget;

  @Input() editMode: boolean;

  @Input() dashboardId: string;

  @Output() edit = new EventEmitter<void>();

  @Output() remove = new EventEmitter<void>();

  issues: Item[];

  trackByNumber = (_i, issue: Item) => issue.number;

  private destroyed = new Subject();

  constructor(
      public issuesRenderer: ItemsRenderer, private dialog: MatDialog,
      private cd: ChangeDetectorRef, private router: Router,
      private activatedRepository: ActivatedRepository) {}

  ngOnInit() {
    this.issuesRenderer.initialize(this.widget.itemType);
    this.issuesRenderer.itemGroups
        .pipe(filter(itemGroups => !!itemGroups), takeUntil(this.destroyed))
        .subscribe(itemGroups => {
          this.issues = [];
          itemGroups.forEach(itemGroup => this.issues.push(...itemGroup.items));
          this.cd.markForCheck();
        });
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['widget'] && this.widget) {
      this.issuesRenderer.options.setState(this.widget.options);
    }
  }

  openIssueModal(issueId: number) {
    this.dialog.open(IssueDetailDialog, {data: {issueId}});
  }

  openQuery() {
    this.router.navigate(
        [`${this.activatedRepository.repository.value}/query/new`],
        {queryParams: {'widget': JSON.stringify(this.widget), dashboard: this.dashboardId}});
  }
}
