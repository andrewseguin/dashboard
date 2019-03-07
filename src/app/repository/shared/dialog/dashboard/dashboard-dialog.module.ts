import {NgModule} from '@angular/core';

import {DeleteConfirmationModule} from '../delete-confirmation/delete-confirmation.module';

import {DashboardDialog} from './dashboard-dialog';
import {DashboardEditModule} from './dashboard-edit/dashboard-edit.module';


@NgModule({
  imports: [
    DeleteConfirmationModule,
    DashboardEditModule,
  ],
  providers: [DashboardDialog]
})
export class DashboardDialogModule {
}
