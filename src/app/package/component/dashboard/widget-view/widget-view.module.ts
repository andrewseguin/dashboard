import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';
import {CountModule} from './count/count.module';
import {ListModule} from './list/list.module';
import {PieChartModule} from './pie-chart/pie-chart.module';
import {TimeSeriesModule} from './time-series/time-series.module';
import {WidgetView} from './widget-view';


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    PieChartModule,
    ListModule,
    CountModule,
    TimeSeriesModule,
  ],
  declarations: [WidgetView],
  exports: [WidgetView],
})
export class WidgetViewModule {
}
