import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';

import {ReportDialogModule} from '../dialog/report/report-dialog.module';

import {ReportMenu} from './report-menu';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    ReportDialogModule,
  ],
  declarations: [ReportMenu],
  exports: [ReportMenu],
})
export class ReportMenuModule {
}
