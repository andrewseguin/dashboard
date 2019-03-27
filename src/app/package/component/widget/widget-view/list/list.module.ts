import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';
import {ItemSummaryModule} from 'app/package/component/items-list/item-summary/item-summary.module';
import {
  ItemDetailDialogModule
} from 'app/repository/shared/dialog/item-detail-dialog/item-detail-dialog.module';
import {
  ButtonToggleGroupOptionModule
} from '../../edit-widget/button-toggle-option/button-toggle-option.module';
import {
  FilterStateOptionModule
} from '../../edit-widget/filter-state-option/filter-state-option.module';
import {InputOptionModule} from '../../edit-widget/input-option/input-option.module';
import {SortStateOptionModule} from '../../edit-widget/sort-state-option/sort-state-option.module';
import {ViewStateOptionModule} from '../../edit-widget/view-state-option/view-state-option.module';
import {List} from './list';
import {ListEdit} from './list-edit';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    ItemSummaryModule,
    ItemDetailDialogModule,
    SortStateOptionModule,
    InputOptionModule,
    ViewStateOptionModule,
    ButtonToggleGroupOptionModule,
    FilterStateOptionModule,
  ],
  declarations: [List, ListEdit],
  exports: [List, ListEdit],
  entryComponents: [List, ListEdit]
})
export class ListModule {
}
