import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';
import {
  IssueDetailDialogModule
} from 'app/repository/shared/dialog/issue-detail-dialog/issue-detail-dialog.module';
import {
  IssueSummaryModule
} from 'app/repository/shared/issues-list/issue-summary/issue-summary.module';
import {LoadingModule} from 'app/repository/shared/loading/loading.module';

import {WidgetView} from './widget-view';


@NgModule({
  imports:
      [CommonModule, MaterialModule, IssueSummaryModule, IssueDetailDialogModule, LoadingModule],
  declarations: [WidgetView],
  exports: [WidgetView],
})
export class WidgetViewModule {
}
