import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {Issue} from 'app/service/github';

@Component({
  selector: 'requests-group',
  templateUrl: 'requests-group.html',
  styleUrls: ['requests-group.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestsGroup {
  @Input() issues: Issue[];

  @Input() title: string;

  trackByIssueNumber = (_i, issue: Issue) => issue.number;

  @Output() selectGroup = new EventEmitter();
}
