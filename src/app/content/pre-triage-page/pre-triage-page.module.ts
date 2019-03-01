import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';
import {PreTriagePage} from './pre-triage-page';
import {TimeAgoPipeModule} from 'app/app.module';
import {IssueDetailModule} from './issue-detail/issue-detail.module';

const routes: Routes = [{path: '', component: PreTriagePage}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class PreTriagePageRoutingModule {
}

@NgModule({
  imports: [CommonModule, PreTriagePageRoutingModule, MaterialModule, IssueDetailModule],
  declarations: [PreTriagePage],
  exports: [PreTriagePage],
})
export class PreTriagePageModule {
}
