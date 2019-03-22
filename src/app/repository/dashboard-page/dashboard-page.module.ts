import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';
import {DashboardViewModule} from 'app/package/component/dashboard/dashboard-view.module';
import {DashboardPage} from './dashboard-page';

const routes: Routes = [{
  path: '',
  component: DashboardPage,
}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class DashboardPageRoutingModule {
}

@NgModule({
  imports: [
    CommonModule, MaterialModule, ReactiveFormsModule, DashboardViewModule,
    DashboardPageRoutingModule
  ],
  declarations: [DashboardPage],
  exports: [DashboardPage],
})
export class DashboardPageModule {
}
