import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';

import {Repository} from './repository';
import {Header, Selection} from './services';
import {ActivatedRepository} from './services/activated-repository';
import {IssueQueriesDao} from './services/dao/issue-queries-dao';
import {IssueRecommendations} from './services/issue-recommendations';
import {Markdown} from './services/markdown';
import {Updater} from './services/updater';
import {CreateStoreModule} from './shared/dialog/create-store/create-store.module';
import {HeaderModule} from './shared/header/header.module';
import {NavModule} from './shared/nav/nav.module';
import {SelectionHeaderModule} from './shared/selection-header/selection-header.module';


const routes: Routes = [{
  path: '',
  component: Repository,
  children: [
    {
      path: 'issue-queries',
      loadChildren:
        'app/repository/issue-queries-page/issue-queries-page.module#IssueQueriesPageModule'
    },
    {
      path: 'issue-query/:id',
      loadChildren:
        'app/repository/issue-query-page/issue-query-page.module#IssueQueryPageModule'
    },
    {
      path: 'config',
      loadChildren:
        'app/repository/config-page/config-page.module#ConfigPageModule'
    },

    {path: '', redirectTo: 'issue-queries', pathMatch: 'full'},
  ]
}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class RepositoryRoutingModule {
}

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    NavModule,
    HeaderModule,
    SelectionHeaderModule,
    RouterModule,
    RepositoryRoutingModule,
    CreateStoreModule,
  ],
  declarations: [Repository],
  exports: [Repository],
  providers: [
    Selection,
    Header,
    Updater,
    IssueRecommendations,
    Markdown,
    ActivatedRepository,
    IssueQueriesDao,
  ]
})
export class RepositoryModule {
}
