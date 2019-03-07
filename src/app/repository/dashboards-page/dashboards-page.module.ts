import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';

import {DashboardDialogModule} from '../shared/dialog/dashboard/dashboard-dialog.module';
import {LoadingModule} from '../shared/loading/loading.module';

import {DashboardsPage} from './dashboards-page';

const routes: Routes = [{path: '', component: DashboardsPage}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class DashboardsPageRoutingModule {
}

@NgModule({
  imports: [
    CommonModule,
    DashboardsPageRoutingModule,
    MaterialModule,
    DashboardDialogModule,
    LoadingModule,
  ],
  declarations: [DashboardsPage],
  exports: [DashboardsPage],
})
export class DashboardsPageModule {
}
