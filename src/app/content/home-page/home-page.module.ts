import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';
import {HomePage} from './home-page';
import {CommonModule} from '@angular/common';

const routes: Routes = [{path: '', component: HomePage}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class HomePageRoutingModule {}

@NgModule({
  imports: [
    CommonModule,
    HomePageRoutingModule,
    MaterialModule
  ],
  declarations: [HomePage],
  exports: [HomePage],
})
export class HomePageModule { }
