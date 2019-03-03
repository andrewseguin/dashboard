import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';

import {RequestView} from './request-view';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
  ],
  declarations: [RequestView],
  exports: [RequestView],
})
export class RequestViewModule {
}
