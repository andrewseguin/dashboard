import {NgModule} from '@angular/core';
import {DeleteConfirmationModule} from '../delete-confirmation/delete-confirmation.module';
import {IssueQueryDialog} from './issue-query-dialog';
import {IssueQueryEditModule} from './issue-query-edit/issue-query-edit.module';

@NgModule({
  imports: [
    DeleteConfirmationModule,
    IssueQueryEditModule,
  ],
  providers: [IssueQueryDialog]
})
export class IssueQueryDialogModule {
}
