import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';
import {LoadingModule} from 'app/repository/shared/loading/loading.module';
import {CountModule} from './count/count.module';
import {ListModule} from './list/list.module';
import {PieChartModule} from './pie-chart/pie-chart.module';
import {WidgetView} from './widget-view';


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    LoadingModule,
    PieChartModule,
    ListModule,
    CountModule,
  ],
  declarations: [WidgetView],
  exports: [WidgetView],
})
export class WidgetViewModule {
}
