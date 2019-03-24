import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';
import {AdvancedSearchModule} from 'app/package/component/advanced-search/advanced-search.module';
import {
  EditableChipListModule
} from 'app/package/component/editable-chip-list/editable-chip-list.module';
import {
  DeleteConfirmationModule
} from 'app/repository/shared/dialog/delete-confirmation/delete-confirmation.module';
import {EditableRecommendation} from './editable-recommendation';


@NgModule({
  imports: [
    CommonModule, MaterialModule, ReactiveFormsModule, DeleteConfirmationModule,
    AdvancedSearchModule, EditableChipListModule
  ],
  declarations: [EditableRecommendation],
  exports: [EditableRecommendation],
})
export class EditableRecommendationModule {
}
