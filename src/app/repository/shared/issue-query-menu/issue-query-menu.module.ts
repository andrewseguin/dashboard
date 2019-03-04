import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';

import {IssueQueryDialogModule} from '../dialog/issue-query/issue-query-dialog.module';

import {IssueQueryMenu} from './issue-query-menu';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    IssueQueryDialogModule,
  ],
  declarations: [IssueQueryMenu],
  exports: [IssueQueryMenu],
})
export class IssueQueryMenuModule {
}
