import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';
import {AdvancedSearchModule} from 'app/package/component/advanced-search/advanced-search.module';
import {
  DisplayOptionsHeaderModule
} from 'app/package/component/display-options-header/display-options-header.module';
import {EditWidget} from './edit-widget';
import {WidgetTypeOptionsModule} from './widget-type-options/widget-type-options.module';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    AdvancedSearchModule,
    DisplayOptionsHeaderModule,
    WidgetTypeOptionsModule,
  ],
  declarations: [EditWidget],
  exports: [EditWidget],
  entryComponents: [EditWidget]
})
export class EditWidgetModule {
}
