import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {Issue} from 'app/service/github';

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

  @Output() selectGroup = new EventEmitter();
}
