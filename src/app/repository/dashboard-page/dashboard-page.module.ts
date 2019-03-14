import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';
import {LoadingModule} from '../shared/loading/loading.module';
import {DashboardPage} from './dashboard-page';
import {EditWidgetModule} from './edit-widget/edit-widget.module';
import {WidgetViewModule} from './widget-view/widget-view.module';


const routes: Routes = [{
  path: '',
  component: DashboardPage,
}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class DashboardPageRoutingModule {
}

@NgModule({
  imports: [
    CommonModule, MaterialModule, ReactiveFormsModule, LoadingModule, EditWidgetModule,
    WidgetViewModule, DashboardPageRoutingModule
  ],
  declarations: [DashboardPage],
  exports: [DashboardPage],
})
export class DashboardPageModule {
}
