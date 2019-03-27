import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';
import {AdvancedSearchModule} from 'app/package/component/advanced-search/advanced-search.module';
import {FilterStateOption} from './filter-state-option';

@NgModule({
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, AdvancedSearchModule],
  declarations: [FilterStateOption],
  exports: [FilterStateOption],
})
export class FilterStateOptionModule {
}
