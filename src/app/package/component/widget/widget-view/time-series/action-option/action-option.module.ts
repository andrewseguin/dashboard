import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';
import {ActionOption} from './action-option';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  declarations: [ActionOption],
  exports: [ActionOption],
  entryComponents: [ActionOption]
})
export class ActionOptionModule {
}
