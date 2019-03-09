import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';
import {
  IssueDetailDialogModule
} from 'app/repository/shared/dialog/item-detail-dialog/item-detail-dialog.module';
import {ItemSummaryModule} from 'app/repository/shared/items-list/item-summary/item-summary.module';
import {LoadingModule} from 'app/repository/shared/loading/loading.module';

import {WidgetView} from './widget-view';


@NgModule({
  imports:
      [CommonModule, MaterialModule, ItemSummaryModule, IssueDetailDialogModule, LoadingModule],
  declarations: [WidgetView],
  exports: [WidgetView],
})
export class WidgetViewModule {
}
