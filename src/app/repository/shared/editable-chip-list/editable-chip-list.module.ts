import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';

import {EditableChipList} from './editable-chip-list';

@NgModule({
  imports: [
    MaterialModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  declarations: [EditableChipList],
  exports: [EditableChipList],
})
export class EditableChipListModule {
}
