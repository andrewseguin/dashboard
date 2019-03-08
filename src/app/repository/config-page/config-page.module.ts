import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';
import {ConfigPage} from './config-page';
import {RecommendationsModule} from './recommendations/recommendations.module';

const routes: Routes = [{path: '', component: ConfigPage}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class ConfigPageRoutingModule {
}

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    RecommendationsModule,
    ConfigPageRoutingModule,
  ],
  declarations: [ConfigPage],
  exports: [ConfigPage],
})
export class ConfigPageModule {
}
