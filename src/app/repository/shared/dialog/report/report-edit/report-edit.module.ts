import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';

import {ReportEdit} from './report-edit';

@NgModule({
  imports: [
    MaterialModule,
    ReactiveFormsModule,
  ],
  declarations: [ReportEdit],
  exports: [ReportEdit],
  entryComponents: [ReportEdit]
})
export class ReportEditModule {
}
