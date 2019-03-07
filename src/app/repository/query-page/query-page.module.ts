import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';
import {IssueQueryDialogModule} from '../shared/dialog/issue-query/issue-query-dialog.module';
import {IssueDetailModule} from '../shared/issue-detail/issue-detail.module';
import {IssueQueryMenuModule} from '../shared/issue-query-menu/issue-query-menu.module';
import {IssuesListModule} from '../shared/issues-list/issues-list.module';
import {QueryPage} from './query-page';


const routes: Routes = [{
  path: '',
  component: QueryPage,
}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class QueryPageRoutingModule {
}

@NgModule({
  imports: [
    CommonModule,
    QueryPageRoutingModule,
    MaterialModule,
    IssueDetailModule,
    IssuesListModule,
    IssueQueryMenuModule,
    IssueQueryDialogModule,
  ],
  declarations: [QueryPage],
  exports: [QueryPage],
})
export class QueryPageModule {
}
