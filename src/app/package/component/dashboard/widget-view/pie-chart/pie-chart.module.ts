import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';
import {PieChart} from './pie-chart';

@NgModule({
  imports: [CommonModule, MaterialModule],
  declarations: [PieChart],
  exports: [PieChart],
  entryComponents: [PieChart]
})
export class PieChartModule {
}
