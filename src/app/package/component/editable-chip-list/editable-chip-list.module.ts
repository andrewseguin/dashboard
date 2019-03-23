import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';
import {EditableChipList} from './editable-chip-list';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
  ],
  declarations: [EditableChipList],
  exports: [EditableChipList]
})
export class EditableChipListModule {
}
