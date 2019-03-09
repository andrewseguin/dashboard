import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';

import {QueryDialogModule} from '../dialog/query/query-dialog.module';

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
