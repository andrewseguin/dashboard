import {NgModule} from '@angular/core';

import {DeleteConfirmationModule} from '../delete-confirmation/delete-confirmation.module';

import {QueryEditModule} from './query-edit/query-edit.module';
import {QueryDialog} from './query-dialog';

@NgModule({
  imports: [
    DeleteConfirmationModule,
    QueryEditModule,
  ],
  providers: [QueryDialog]
})
export class QueryDialogModule {
}
