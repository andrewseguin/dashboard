import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {TimeAgoPipeModule} from 'app/app.module';
import {MaterialModule} from 'app/material.module';

import {LabelListModule} from '../label-list/label-list.module';
import {RecommendationActionModule} from '../recommendation-action/recommendation-action.module';

import {IssueDetail} from './issue-detail';

@NgModule({
  imports: [
    CommonModule, MaterialModule, TimeAgoPipeModule, LabelListModule,
    RecommendationActionModule
  ],
  declarations: [IssueDetail],
  exports: [IssueDetail],
})
export class IssueDetailModule {
}
