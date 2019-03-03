import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';

import {IssueDetail} from '../shared/issue-detail/issue-detail';
import {IssueDetailModule} from '../shared/issue-detail/issue-detail.module';
import {ReportMenuModule} from '../shared/report-menu/report-menu.module';

import {IssuesPage} from './issues-page';
import {IssuesListModule} from '../shared/issues-list/issues-list.module';

const routes: Routes = [{
  path: '',
  component: IssuesPage,
}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class IssuesPageRoutingModule {
}

@NgModule({
  imports: [
    CommonModule,
    IssuesPageRoutingModule,
    MaterialModule,
    IssueDetailModule,
    IssuesListModule,
    ReportMenuModule,
  ],
  declarations: [IssuesPage],
  exports: [IssuesPage],
})
export class IssuesPageModule {
}
