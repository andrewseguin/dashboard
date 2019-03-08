import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';

import {LoadingModule} from '../shared/loading/loading.module';

import {DatabasePage} from './database-page';
import {LoadDataModule} from './load-data/load-data.module';

const routes: Routes = [{path: '', component: DatabasePage}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class DatabasePageRoutingModule {
}

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    LoadingModule,
    DatabasePageRoutingModule,
    LoadDataModule,
  ],
  declarations: [DatabasePage],
  exports: [DatabasePage],
})
export class DatabasePageModule {
}
