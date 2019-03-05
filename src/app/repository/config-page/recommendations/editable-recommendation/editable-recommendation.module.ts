import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MaterialModule} from 'app/material.module';
import {EditableRecommendation} from './editable-recommendation';
import {ReactiveFormsModule} from '@angular/forms';
import {DeleteConfirmationModule} from 'app/repository/shared/dialog/delete-confirmation/delete-confirmation.module';
import {AdvancedSearchModule} from 'app/repository/shared/advanced-search/advanced-search.module';

@NgModule({
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, DeleteConfirmationModule, AdvancedSearchModule],
  declarations: [EditableRecommendation],
  exports: [EditableRecommendation],
})
export class EditableRecommendationModule {}
