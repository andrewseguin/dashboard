import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';
import {WidgetTypeOptions} from './widget-type-options';
import { EditableChipListModule } from 'app/repository/shared/editable-chip-list/editable-chip-list.module';

@NgModule({
  imports: [CommonModule, MaterialModule, EditableChipListModule, ReactiveFormsModule],
  declarations: [WidgetTypeOptions],
  exports: [WidgetTypeOptions],
})
export class WidgetTypeOptionsModule {
}
