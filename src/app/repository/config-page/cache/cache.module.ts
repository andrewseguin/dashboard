import {NgModule} from '@angular/core';
import {Cache} from './cache';
import {CommonModule} from '@angular/common';
import {MaterialModule} from 'app/material.module';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
  ],
  declarations: [Cache],
  exports: [Cache],
})
export class CacheModule {}
