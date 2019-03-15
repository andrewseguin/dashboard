import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';
import {AdvancedSearchModule} from 'app/repository/shared/advanced-search/advanced-search.module';
import {
  DisplayOptionsHeaderModule
} from 'app/repository/shared/items-list/display-options-header/display-options-header.module';
import {EditWidget} from './edit-widget';


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    AdvancedSearchModule,
    DisplayOptionsHeaderModule,
  ],
  declarations: [EditWidget],
  exports: [EditWidget],
  entryComponents: [EditWidget]
})
export class EditWidgetModule {
}