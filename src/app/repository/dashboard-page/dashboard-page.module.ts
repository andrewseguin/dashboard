import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';
import {DashboardViewModule} from 'app/package/component/dashboard/dashboard-view.module';
import {CountModule} from 'app/package/component/dashboard/widget-view/count/count.module';
import {ListModule} from 'app/package/component/dashboard/widget-view/list/list.module';
import {
  PieChartModule
} from 'app/package/component/dashboard/widget-view/pie-chart/pie-chart.module';
import {
  TimeSeriesModule
} from 'app/package/component/dashboard/widget-view/time-series/time-series.module';
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
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    DashboardViewModule,
    DashboardPageRoutingModule,
    PieChartModule,
    ListModule,
    CountModule,
    TimeSeriesModule,
  ],
  declarations: [DashboardPage],
  exports: [DashboardPage],
})
export class DashboardPageModule {
}
