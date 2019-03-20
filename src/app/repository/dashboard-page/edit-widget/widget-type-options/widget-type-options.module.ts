import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';
import {WidgetTypeOptions} from './widget-type-options';

@NgModule({
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  declarations: [WidgetTypeOptions],
  exports: [WidgetTypeOptions],
})
export class WidgetTypeOptionsModule {
}