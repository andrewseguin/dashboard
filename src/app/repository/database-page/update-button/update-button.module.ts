import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';
import {UpdateButton} from './update-button';


@NgModule({
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  declarations: [UpdateButton],
  exports: [UpdateButton],
})
export class UpdateButtonModule {
}
