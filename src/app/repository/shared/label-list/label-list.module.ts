import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';
import {LabelList} from './label-list';

@NgModule({
  imports: [CommonModule, MaterialModule],
  declarations: [LabelList],
  exports: [LabelList],
})
export class LabelListModule {
}
