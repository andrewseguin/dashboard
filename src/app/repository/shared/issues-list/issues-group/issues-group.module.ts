import {NgModule} from '@angular/core';
import {IssuesGroup} from './issues-group';
import {CommonModule} from '@angular/common';
import {IssueViewModule} from '../issue-view/issue-view.module';
import {MaterialModule} from 'app/material.module';

@NgModule({
  imports: [
    IssueViewModule,
    CommonModule,
    MaterialModule,
  ],
  declarations: [IssuesGroup],
  exports: [IssuesGroup]
})
export class IssuesGroupModule { }
