import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';
import {WidgetView} from './widget-view';


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
  ],
  declarations: [WidgetView],
  exports: [WidgetView],
})
export class WidgetViewModule {
}
