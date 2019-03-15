import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';
import {TypeActions} from './type-actions';


@NgModule({
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  declarations: [TypeActions],
  exports: [TypeActions],
})
export class TypeActionsModule {
}
