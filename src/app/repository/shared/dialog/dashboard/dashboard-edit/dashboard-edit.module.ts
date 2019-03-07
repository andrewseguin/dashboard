import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';

import {DashboardEdit} from './dashboard-edit';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  declarations: [DashboardEdit],
  exports: [DashboardEdit],
  entryComponents: [DashboardEdit]
})
export class DashboardEditModule {
}
