import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';

import {ReportMenu} from './report-menu';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
  ],
  declarations: [ReportMenu],
  exports: [ReportMenu],
})
export class ReportMenuModule {
}
