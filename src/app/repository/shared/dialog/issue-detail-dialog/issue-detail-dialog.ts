import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {IssuesRenderer} from 'app/repository/services/issues-renderer/issues-renderer';
import {Issue} from 'app/service/github';

export interface IssueDetailDialogData {
  issueId: number;
}

@Component({
  templateUrl: 'issue-detail-dialog.html',
  styleUrls: ['issue-detail-dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [IssuesRenderer]
})
export class IssueDetailDialog {
  issue: Issue;

  constructor(
      private dialogRef: MatDialogRef<IssueDetailDialog, void>,
      @Inject(MAT_DIALOG_DATA) public data: IssueDetailDialogData) {}
}
