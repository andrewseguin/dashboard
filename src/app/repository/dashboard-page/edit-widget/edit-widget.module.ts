import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';
import {AdvancedSearchModule} from 'app/package/advanced-search/advanced-search.module';
import {
  DisplayOptionsHeaderModule
} from 'app/package/display-options-header/display-options-header.module';
import {EditWidgetOptionsModule} from './edit-options/edit-widget-options.module';
import {EditWidget} from './edit-widget';


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    AdvancedSearchModule,
    DisplayOptionsHeaderModule,
    EditWidgetOptionsModule,
  ],
  declarations: [EditWidget],
  exports: [EditWidget],
  entryComponents: [EditWidget]
})
export class EditWidgetModule {
}
