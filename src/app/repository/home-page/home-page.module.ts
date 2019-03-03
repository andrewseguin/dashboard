import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';
import {HomePage} from './home-page';
import {CommonModule} from '@angular/common';
import {CreateStoreModule} from '../shared/dialog/create-store/create-store.module';

const routes: Routes = [{path: '', component: HomePage}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class HomePageRoutingModule {}

@NgModule({
  imports: [
    CommonModule,
    HomePageRoutingModule,
    MaterialModule,
    CreateStoreModule,
  ],
  declarations: [HomePage],
  exports: [HomePage],
})
export class HomePageModule {}
