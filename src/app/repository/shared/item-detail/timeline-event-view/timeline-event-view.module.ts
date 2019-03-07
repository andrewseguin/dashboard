import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {TimeAgoPipeModule} from 'app/app.module';
import {MaterialModule} from 'app/material.module';

import {LabelListModule} from '../../label-list/label-list.module';

import {TimelineEventView} from './timeline-event-view';

@NgModule({
  imports: [CommonModule, MaterialModule, TimeAgoPipeModule, LabelListModule],
  declarations: [TimelineEventView],
  exports: [TimelineEventView],
})
export class TimelineEventViewModule {
}
