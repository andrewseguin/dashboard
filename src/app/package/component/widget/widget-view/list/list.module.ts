import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';
import {ItemSummaryModule} from 'app/package/component/items-list/item-summary/item-summary.module';
import {
  ItemDetailDialogModule
} from 'app/repository/shared/dialog/item-detail-dialog/item-detail-dialog.module';
import {List} from './list';

@NgModule({
  imports: [CommonModule, MaterialModule, ItemSummaryModule, ItemDetailDialogModule],
  declarations: [List],
  exports: [List],
  entryComponents: [List]
})
export class ListModule {
}
