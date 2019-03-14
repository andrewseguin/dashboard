import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';
import {ConfirmConfigUpdates} from './confirm-config-updates';


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
  ],
  declarations: [ConfirmConfigUpdates],
  exports: [ConfirmConfigUpdates],
  entryComponents: [ConfirmConfigUpdates]
})
export class ConfirmConfigUpdatesModule {
}
