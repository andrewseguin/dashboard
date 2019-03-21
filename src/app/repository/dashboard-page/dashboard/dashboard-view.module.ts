import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';
import {DashboardView} from './dashboard-view';
import {EditWidgetModule} from './edit-widget/edit-widget.module';
import {WidgetViewModule} from './widget-view/widget-view.module';

@NgModule({
  imports: [CommonModule, MaterialModule, EditWidgetModule, WidgetViewModule],
  declarations: [DashboardView],
  exports: [DashboardView],
})
export class DashboardViewModule {
}
