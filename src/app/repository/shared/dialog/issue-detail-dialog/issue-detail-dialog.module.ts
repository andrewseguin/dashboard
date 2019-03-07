import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';

import {IssueDetailModule} from '../../issue-detail/issue-detail.module';

import {IssueDetailDialog} from './issue-detail-dialog';


@NgModule({
  imports: [
    MaterialModule,
    IssueDetailModule,
  ],
  declarations: [IssueDetailDialog],
  exports: [IssueDetailDialog],
  entryComponents: [IssueDetailDialog]
})
export class IssueDetailDialogModule {
}
