import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';

import {IssueDetailDialogModule} from '../../dialog/item-detail-dialog/item-detail-dialog.module';
import {ItemSummaryModule} from '../item-summary/item-summary.module';

import {ItemsGroup} from './items-group';

@NgModule({
  imports: [
    ItemSummaryModule,
    CommonModule,
    MaterialModule,
    IssueDetailDialogModule,
  ],
  declarations: [ItemsGroup],
  exports: [ItemsGroup]
})
export class ItemsGroupModule {
}
