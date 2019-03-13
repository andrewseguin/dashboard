import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';
import {LoadingModule} from '../shared/loading/loading.module';
import {
  EditableRecommendationModule
} from './editable-recommendation/editable-recommendation.module';
import {RecommendationsPage} from './recommendations-page';

const routes: Routes = [{path: '', component: RecommendationsPage}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class RecommendationsPageRoutingModule {
}

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    LoadingModule,
    EditableRecommendationModule,
    RecommendationsPageRoutingModule,
  ],
  declarations: [RecommendationsPage],
  exports: [RecommendationsPage],
})
export class RecommendationsPageModule {
}
