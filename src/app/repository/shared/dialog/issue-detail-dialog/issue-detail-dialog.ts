import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ItemsRenderer} from 'app/repository/services/items-renderer/items-renderer';
import {Item} from 'app/service/github';

export interface IssueDetailDialogData {
  issueId: number;
}

@Component({
  templateUrl: 'issue-detail-dialog.html',
  styleUrls: ['issue-detail-dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ItemsRenderer]
})
export class IssueDetailDialog {
  issue: Item;

  constructor(
      private dialogRef: MatDialogRef<IssueDetailDialog, void>,
      @Inject(MAT_DIALOG_DATA) public data: IssueDetailDialogData) {}
}
