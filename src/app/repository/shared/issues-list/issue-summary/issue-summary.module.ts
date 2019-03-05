import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';

import {LabelListModule} from '../../label-list/label-list.module';

import {IssueSummary} from './issue-summary';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    LabelListModule,
  ],
  declarations: [IssueSummary],
  exports: [IssueSummary],
})
export class IssueSummaryModule {
}
