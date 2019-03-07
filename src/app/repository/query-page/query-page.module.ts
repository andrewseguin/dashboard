import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';

import {QueryDialogModule} from '../shared/dialog/issue-query/issue-query-dialog.module';
import {IssuesListModule} from '../shared/items-list/items-list.module';
import {QueryMenuModule} from '../shared/query-menu/query-menu.module';

import {QueryPage} from './query-page';
import { ItemDetailModule } from '../shared/item-detail/item-detail.module';


const routes: Routes = [{
  path: '',
  component: QueryPage,
}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class QueryPageRoutingModule {
}

@NgModule({
  imports: [
    CommonModule,
    QueryPageRoutingModule,
    MaterialModule,
    ItemDetailModule,
    IssuesListModule,
    QueryMenuModule,
    QueryDialogModule,
  ],
  declarations: [QueryPage],
  exports: [QueryPage],
})
export class QueryPageModule {
}
