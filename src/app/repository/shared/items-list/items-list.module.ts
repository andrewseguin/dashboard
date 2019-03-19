import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';
import {LoadingModule} from '../loading/loading.module';
import {AdvancedSearchModule} from './advanced-search/advanced-search.module';
import {DisplayOptionsHeaderModule} from './display-options-header/display-options-header.module';
import {ItemsGroupModule} from './items-group/items-group.module';
import {ItemsList} from './items-list';


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    ItemsGroupModule,
    DisplayOptionsHeaderModule,
    AdvancedSearchModule,
    LoadingModule,
  ],
  declarations: [ItemsList],
  exports: [ItemsList],
})
export class IssuesListModule {
}
