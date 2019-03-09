import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';

import {QueryEditModule} from '../shared/dialog/query/query-edit/query-edit.module';
import {LoadingModule} from '../shared/loading/loading.module';
import {QueryMenuModule} from '../shared/query-menu/query-menu.module';

import {QueriesPage} from './queries-page';

const routes: Routes = [{path: '', component: QueriesPage}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class QueriesPageRoutingModule {
}

@NgModule({
  imports: [
    CommonModule,
    QueriesPageRoutingModule,
    MaterialModule,
    LoadingModule,
    QueryEditModule,
    QueryMenuModule,
  ],
  declarations: [QueriesPage],
  exports: [QueriesPage],
})
export class QueriesPageModule {
}
