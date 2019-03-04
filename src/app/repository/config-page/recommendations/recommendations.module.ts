import {NgModule} from '@angular/core';
import {Recommendations} from './recommendations';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';
import {CommonModule} from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  declarations: [Recommendations],
  exports: [Recommendations],
})
export class RecommendationsModule {}
