import {NgModule} from '@angular/core';
import {Recommendations} from './recommendations';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';
import {CommonModule} from '@angular/common';
import {EditableRecommendationModule} from './editable-recommendation/editable-recommendation.module';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    EditableRecommendationModule,
  ],
  declarations: [Recommendations],
  exports: [Recommendations],
})
export class RecommendationsModule {}
