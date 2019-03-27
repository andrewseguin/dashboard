import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';
import {SortStateOption} from './sort-state-option';

@NgModule({
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  declarations: [SortStateOption],
  exports: [SortStateOption],
})
export class SortStateOptionModule {
}
