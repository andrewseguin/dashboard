import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';
import {HomePage as ReportsPage} from './reports-page';
import {CommonModule} from '@angular/common';

const routes: Routes = [{path: '', component: ReportsPage}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class ReportsPageRoutingModule {}

@NgModule({
  imports: [
    CommonModule,
    ReportsPageRoutingModule,
    MaterialModule,
  ],
  declarations: [ReportsPage],
  exports: [ReportsPage],
})
export class ReportsPageModule {}
