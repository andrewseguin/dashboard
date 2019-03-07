import {NgModule} from '@angular/core';
import {DeleteConfirmationModule} from '../delete-confirmation/delete-confirmation.module';
import {QueryDialog} from './issue-query-dialog';
import {QueryEditModule} from './issue-query-edit/query-edit.module';

@NgModule({
  imports: [
    DeleteConfirmationModule,
    QueryEditModule,
  ],
  providers: [QueryDialog]
})
export class QueryDialogModule {
}
