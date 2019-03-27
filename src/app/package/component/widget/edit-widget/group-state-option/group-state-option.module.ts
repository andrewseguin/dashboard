import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';
import {GroupStateOption} from './group-state-option';

@NgModule({
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  declarations: [GroupStateOption],
  exports: [GroupStateOption],
})
export class GroupStateOptionModule {
}
