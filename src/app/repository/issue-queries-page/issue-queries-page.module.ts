import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';

import {IssueQueryEditModule} from '../shared/dialog/issue-query/issue-query-edit/issue-query-edit.module';
import {IssueQueryMenuModule} from '../shared/issue-query-menu/issue-query-menu.module';
import {LoadingModule} from '../shared/loading/loading.module';

import {IssueQueriesPage} from './issue-queries-page';

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
    IssueQueryEditModule,
    IssueQueryMenuModule,
  ],
  declarations: [IssueQueriesPage],
  exports: [IssueQueriesPage],
})
export class IssueQueriesPageModule {
}
