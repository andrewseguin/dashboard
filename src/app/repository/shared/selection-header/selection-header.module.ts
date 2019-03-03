import {SelectionHeader} from './selection-header';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';
import {CommonModule} from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
  ],
  declarations: [SelectionHeader],
  exports: [SelectionHeader],
})
export class SelectionHeaderModule { }
