import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';

import {QueryDialogModule} from '../dialog/issue-query/issue-query-dialog.module';

import {QueryMenu} from './query-menu';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    QueryDialogModule,
  ],
  declarations: [QueryMenu],
  exports: [QueryMenu],
})
export class QueryMenuModule {
}
