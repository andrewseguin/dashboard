import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';

import {EditWidgetModule} from '../shared/dialog/edit-widget/edit-widget.module';
import {LoadingModule} from '../shared/loading/loading.module';

import {DashboardPage} from './dashboard-page';


const routes: Routes = [{
  path: '',
  component: DashboardPage,
}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class DashboardPageRoutingModule {
}

@NgModule({
  imports:
      [CommonModule, MaterialModule, LoadingModule, EditWidgetModule, DashboardPageRoutingModule],
  declarations: [DashboardPage],
  exports: [DashboardPage],
})
export class DashboardPageModule {
}
