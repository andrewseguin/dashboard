import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';
import {Count} from './count';

@NgModule({
  imports: [CommonModule, MaterialModule],
  declarations: [Count],
  exports: [Count],
  entryComponents: [Count]
})
export class CountModule {
}
