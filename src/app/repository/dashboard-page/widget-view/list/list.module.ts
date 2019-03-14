import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';
import {ItemSummaryModule} from 'app/repository/shared/items-list/item-summary/item-summary.module';
import {List} from './list';

@NgModule({
  imports: [CommonModule, MaterialModule, ItemSummaryModule],
  declarations: [List],
  exports: [List],
})
export class ListModule {
}
