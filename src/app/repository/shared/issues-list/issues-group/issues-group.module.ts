import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';

import {IssueSummaryModule} from '../issue-summary/issue-summary.module';

import {IssuesGroup} from './issues-group';

@NgModule({
  imports: [
    IssueSummaryModule,
    CommonModule,
    MaterialModule,
  ],
  declarations: [IssuesGroup],
  exports: [IssuesGroup]
})
export class IssuesGroupModule {
}
