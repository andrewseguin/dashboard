import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';
import {ReportDialogModule} from '../shared/dialog/report/report-dialog.module';
import {IssueDetailModule} from '../shared/issue-detail/issue-detail.module';
import {IssuesListModule} from '../shared/issues-list/issues-list.module';
import {ReportMenuModule} from '../shared/report-menu/report-menu.module';
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
    ReportMenuModule,
    ReportDialogModule,
  ],
  declarations: [IssueQueryPage],
  exports: [IssueQueryPage],
})
export class IssueQueryPageModule {
}
