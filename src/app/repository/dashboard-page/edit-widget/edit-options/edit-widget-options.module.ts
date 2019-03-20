import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';
import {EditWidgetOptions} from './edit-widget-options';

@NgModule({
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  declarations: [EditWidgetOptions],
  exports: [EditWidgetOptions],
})
export class EditWidgetOptionsModule {
}
