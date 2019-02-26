import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';
import {Updater} from './updater';
import {CommonModule} from '@angular/common';

@NgModule({
  imports: [MaterialModule, CommonModule],
  declarations: [Updater],
  exports: [Updater],
})
export class UpdaterModule {}
