import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ItemsRenderer} from 'app/package/items-renderer/items-renderer';

export interface ItemDetailDialogData {
  itemId: string;
}

@Component({
  templateUrl: 'item-detail-dialog.html',
  styleUrls: ['item-detail-dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ItemsRenderer]
})
export class ItemDetailDialog {
  constructor(
      private dialogRef: MatDialogRef<ItemDetailDialog, void>,
      @Inject(MAT_DIALOG_DATA) public data: ItemDetailDialogData) {}
}
