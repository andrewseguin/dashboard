import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';
import {NewFab} from './new-fab';

@NgModule({
  imports: [MaterialModule],
  declarations: [NewFab],
  exports: [NewFab],
})
export class NewFabModule {
}
