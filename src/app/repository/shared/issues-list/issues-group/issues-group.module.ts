import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';

import {IssueDetailDialogModule} from '../../dialog/issue-detail-dialog/issue-detail-dialog.module';
import {IssueSummaryModule} from '../issue-summary/issue-summary.module';

import {IssuesGroup} from './issues-group';

@NgModule({
  imports: [
    IssueSummaryModule,
    CommonModule,
    MaterialModule,
    IssueDetailDialogModule,
  ],
  declarations: [IssuesGroup],
  exports: [IssuesGroup]
})
export class IssuesGroupModule {
}
