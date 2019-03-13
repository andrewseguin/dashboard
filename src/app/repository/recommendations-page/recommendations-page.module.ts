import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';
import {LoadingModule} from '../shared/loading/loading.module';
import {
  EditableRecommendationModule
} from './editable-recommendation/editable-recommendation.module';
import {RecommendationsPage} from './recommendations-page';
import { NewFabModule } from 'app/shared/new-fab/new-fab.module';

const routes: Routes = [{path: '', component: RecommendationsPage}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class RecommendationsPageRoutingModule {
}

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    LoadingModule,
    ReactiveFormsModule,
    NewFabModule,
    EditableRecommendationModule,
    RecommendationsPageRoutingModule,
  ],
  declarations: [RecommendationsPage],
  exports: [RecommendationsPage],
})
export class RecommendationsPageModule {
}
