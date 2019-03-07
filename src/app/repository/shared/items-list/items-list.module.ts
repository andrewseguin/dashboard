import {NgModule} from '@angular/core';
import {ItemsList} from './items-list';
import {CommonModule} from '@angular/common';
import {DisplayOptionsHeaderModule} from './display-options-header/display-options-header.module';
import {MaterialModule} from 'app/material.module';
import {AdvancedSearchModule} from '../advanced-search/advanced-search.module';
import {LoadingModule} from '../loading/loading.module';
import {IssuesGroupModule} from './issues-group/issues-group.module';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    IssuesGroupModule,
    DisplayOptionsHeaderModule,
    AdvancedSearchModule,
    LoadingModule,
  ],
  declarations: [ItemsList],
  exports: [ItemsList],
})
export class IssuesListModule { }
