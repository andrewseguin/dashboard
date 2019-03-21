import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';
import {AdvancedSearchModule} from 'app/package/component/advanced-search/advanced-search.module';
import {
  DisplayOptionsHeaderModule
} from 'app/package/component/display-options-header/display-options-header.module';
import {LoadingModule} from '../loading/loading.module';
import {ItemSummaryModule} from './item-summary/item-summary.module';
import {ItemsList} from './items-list';


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    ItemSummaryModule,
    DisplayOptionsHeaderModule,
    AdvancedSearchModule,
    LoadingModule,
  ],
  declarations: [ItemsList],
  exports: [ItemsList],
})
export class IssuesListModule {
}
