import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';
import {
  EditableChipListModule
} from 'app/package/component/editable-chip-list/editable-chip-list.module';
import {ViewStateOption} from './view-state-option';

@NgModule({
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, EditableChipListModule],
  declarations: [ViewStateOption],
  exports: [ViewStateOption],
})
export class ViewStateOptionModule {
}
