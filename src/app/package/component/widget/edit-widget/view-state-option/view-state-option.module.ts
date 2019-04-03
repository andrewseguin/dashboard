import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {
  EditableChipListModule
} from 'app/package/component/editable-chip-list/editable-chip-list.module';
import {ViewStateOption} from './view-state-option';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, EditableChipListModule],
  declarations: [ViewStateOption],
  exports: [ViewStateOption],
})
export class ViewStateOptionModule {
}
