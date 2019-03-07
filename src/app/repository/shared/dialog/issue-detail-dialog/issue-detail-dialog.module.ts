import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';

import {ItemDetailModule} from '../../item-detail/item-detail.module';

import {IssueDetailDialog} from './issue-detail-dialog';


@NgModule({
  imports: [
    MaterialModule,
    ItemDetailModule,
  ],
  declarations: [IssueDetailDialog],
  exports: [IssueDetailDialog],
  entryComponents: [IssueDetailDialog]
})
export class IssueDetailDialogModule {
}
