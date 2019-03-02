import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';

import {IssueDetailModule} from './issue-detail/issue-detail.module';
import {IssuesPage} from './issues-page';

const routes: Routes = [{path: '', component: IssuesPage}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class IssuesPageRoutingModule {
}

@NgModule({
  imports: [
    CommonModule, IssuesPageRoutingModule, MaterialModule, IssueDetailModule
  ],
  declarations: [IssuesPage],
  exports: [IssuesPage],
})
export class IssuesPageModule {
}
