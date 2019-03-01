import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {TimeAgoPipeModule} from 'app/app.module';
import {MaterialModule} from 'app/material.module';
import {IssueDetail} from './issue-detail';

@NgModule({
  imports: [CommonModule, MaterialModule, TimeAgoPipeModule, TimeAgoPipeModule],
  declarations: [IssueDetail],
  exports: [IssueDetail],
})
export class IssueDetailModule {
}
