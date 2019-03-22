import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';
import {
  IssueDetailDialogModule
} from 'app/repository/shared/dialog/item-detail-dialog/item-detail-dialog.module';
import {ItemSummaryModule} from 'app/repository/shared/items-list/item-summary/item-summary.module';
import {List} from './list';

@NgModule({
  imports: [CommonModule, MaterialModule, ItemSummaryModule, IssueDetailDialogModule],
  declarations: [List],
  exports: [List],
  entryComponents: [List]
})
export class ListModule {
}
