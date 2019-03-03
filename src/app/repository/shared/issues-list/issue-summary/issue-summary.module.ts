import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';

import {IssueSummary} from './issue-summary';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
  ],
  declarations: [IssueSummary],
  exports: [IssueSummary],
})
export class IssueSummaryModule {
}
