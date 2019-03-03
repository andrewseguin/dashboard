import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';

import {IssueView} from './issue-view';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
  ],
  declarations: [IssueView],
  exports: [IssueView],
})
export class IssueViewModule {
}
