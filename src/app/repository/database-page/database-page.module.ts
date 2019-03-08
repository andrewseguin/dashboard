import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';

import {
  DeleteConfirmationModule
} from '../shared/dialog/delete-confirmation/delete-confirmation.module';
import {LabelListModule} from '../shared/label-list/label-list.module';
import {LoadingModule} from '../shared/loading/loading.module';

import {DatabasePage} from './database-page';
import {LoadDataModule} from './load-data/load-data.module';
import {UpdateButtonModule} from './update-button/update-button.module';


const routes: Routes = [{path: '', component: DatabasePage}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class DatabasePageRoutingModule {
}

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    LoadingModule,
    ReactiveFormsModule,
    DeleteConfirmationModule,
    UpdateButtonModule,
    DatabasePageRoutingModule,
    LabelListModule,
    LoadDataModule,
  ],
  declarations: [DatabasePage],
  exports: [DatabasePage],
})
export class DatabasePageModule {
}
