import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';
import {RecommendationAction} from './recommendation-action';
import {LabelListModule} from '../label-list/label-list.module';

@NgModule({
  imports: [CommonModule, MaterialModule, LabelListModule],
  declarations: [RecommendationAction],
  exports: [RecommendationAction],
})
export class RecommendationActionModule {
}
