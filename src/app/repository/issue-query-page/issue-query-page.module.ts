import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';

import {IssueQueryDialogModule} from '../shared/dialog/issue-query/issue-query-dialog.module';
import {IssueDetailModule} from '../shared/issue-detail/issue-detail.module';
import {IssuesListModule} from '../shared/issues-list/issues-list.module';
import {IssueQueryMenuModule} from '../shared/issue-query-menu/issue-query-menu.module';

import {IssueQueryPage} from './issue-query-page';



const routes: Routes = [{
  path: '',
  component: IssueQueryPage,
}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class IssueQueryPageRoutingModule {
}

@NgModule({
  imports: [
    CommonModule,
    IssueQueryPageRoutingModule,
    MaterialModule,
    IssueDetailModule,
    IssuesListModule,
    IssueQueryMenuModule,
    IssueQueryDialogModule,
  ],
  declarations: [IssueQueryPage],
  exports: [IssueQueryPage],
})
export class IssueQueryPageModule {
}
