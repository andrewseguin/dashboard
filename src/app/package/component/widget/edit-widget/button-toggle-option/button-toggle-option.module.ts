import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';
import {ButtonToggleGroupOption} from './button-toggle-option';

@NgModule({
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  declarations: [ButtonToggleGroupOption],
  exports: [ButtonToggleGroupOption],
})
export class ButtonToggleGroupOptionModule {
}
