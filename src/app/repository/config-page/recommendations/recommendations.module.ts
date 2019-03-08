import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';
import {LoadingModule} from 'app/repository/shared/loading/loading.module';

import {
  EditableRecommendationModule
} from './editable-recommendation/editable-recommendation.module';
import {Recommendations} from './recommendations';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    LoadingModule,
    EditableRecommendationModule,
  ],
  declarations: [Recommendations],
  exports: [Recommendations],
})
export class RecommendationsModule {
}
