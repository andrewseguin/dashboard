import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';

import {IssueDetail} from '../shared/issue-detail/issue-detail';
import {IssueDetailModule} from '../shared/issue-detail/issue-detail.module';
import {ReportMenuModule} from '../shared/report-menu/report-menu.module';
import {RequestsListModule} from '../shared/requests-list/requests-list.module';

import {IssuesPage} from './issues-page';

const routes: Routes = [{
  path: '',
  component: IssuesPage,
  children: [{path: ':id', component: IssueDetail}]
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
    RequestsListModule,
    ReportMenuModule,
  ],
  declarations: [IssuesPage],
  exports: [IssuesPage],
})
export class IssuesPageModule {
}
