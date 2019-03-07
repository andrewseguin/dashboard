import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {TimeAgoPipeModule} from 'app/app.module';
import {MaterialModule} from 'app/material.module';

import {LabelListModule} from '../label-list/label-list.module';
import {RecommendationActionModule} from '../recommendation-action/recommendation-action.module';

import {CommentViewModule} from './comment-view/comment-view.module';
import {IssueDetail} from './issue-detail';
import {TimelineEventViewModule} from './timeline-event-view/timeline-event-view.module';

@NgModule({
  imports: [
    CommonModule, MaterialModule, TimeAgoPipeModule, LabelListModule, CommentViewModule,
    RecommendationActionModule, TimelineEventViewModule
  ],
  declarations: [IssueDetail],
  exports: [IssueDetail],
})
export class IssueDetailModule {
}
