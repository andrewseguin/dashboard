import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';

import {LabelListModule} from '../../label-list/label-list.module';

import {ItemSummary} from './item-summary';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    LabelListModule,
  ],
  declarations: [ItemSummary],
  exports: [ItemSummary],
})
export class ItemSummaryModule {
}
