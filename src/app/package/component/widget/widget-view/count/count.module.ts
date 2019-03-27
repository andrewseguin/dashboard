import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';
import {ItemFiltererState} from 'app/package/items-renderer/item-filterer';
import {
  ButtonToggleGroupOptionModule
} from '../../edit-widget/button-toggle-option/button-toggle-option.module';
import {
  FilterStateOptionModule
} from '../../edit-widget/filter-state-option/filter-state-option.module';
import {InputOptionModule} from '../../edit-widget/input-option/input-option.module';
import {Count} from './count';
import {EditCount} from './count-edit';

export interface CountDisplayTypeOptions {
  dataSourceType: string;
  fontSize: 'small'|'normal'|'large';
  filtererState: ItemFiltererState;
}

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    InputOptionModule,
    ButtonToggleGroupOptionModule,
    FilterStateOptionModule,
  ],
  declarations: [EditCount, Count],
  exports: [EditCount, Count],
  entryComponents: [EditCount, Count]
})
export class CountModule {
}
