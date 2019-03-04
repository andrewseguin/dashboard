import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';

import {IssueQueryEdit} from './issue-query-edit';

@NgModule({
  imports: [
    MaterialModule,
    ReactiveFormsModule,
  ],
  declarations: [IssueQueryEdit],
  exports: [IssueQueryEdit],
  entryComponents: [IssueQueryEdit]
})
export class IssueQueryEditModule {
}
