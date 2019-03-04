import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';

import {ReportEditModule} from '../shared/dialog/report/report-edit/report-edit.module';
import {LoadingModule} from '../shared/loading/loading.module';

import {IssueQueriesPage as IssueQueriesPage} from './issue-queries-page';
import {ReportMenuModule} from '../shared/report-menu/report-menu.module';

const routes: Routes = [{path: '', component: IssueQueriesPage}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class IssueQueriesPageRoutingModule {
}

@NgModule({
  imports: [
    CommonModule,
    IssueQueriesPageRoutingModule,
    MaterialModule,
    LoadingModule,
    ReportEditModule,
    ReportMenuModule,
  ],
  declarations: [IssueQueriesPage],
  exports: [IssueQueriesPage],
})
export class IssueQueriesPageModule {
}
