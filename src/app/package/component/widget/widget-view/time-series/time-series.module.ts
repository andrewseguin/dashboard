import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';
import {TimeSeries} from './time-series';

@NgModule({
  imports: [CommonModule, MaterialModule],
  declarations: [TimeSeries],
  exports: [TimeSeries],
  entryComponents: [TimeSeries]
})
export class TimeSeriesModule {
}
