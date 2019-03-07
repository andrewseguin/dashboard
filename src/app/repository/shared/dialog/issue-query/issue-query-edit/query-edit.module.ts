import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';

import {QueryEdit} from './query-edit';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  declarations: [QueryEdit],
  exports: [QueryEdit],
  entryComponents: [QueryEdit]
})
export class QueryEditModule {
}
