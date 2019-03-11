import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';
import {Repository} from './repository';
import {Header} from './services';
import {ActivatedRepository} from './services/activated-repository';
import {
  ContributorsDao,
  DashboardsDao,
  ItemsDao,
  LabelsDao,
  QueriesDao,
  RecommendationsDao
} from './services/dao';
import {RepoDao} from './services/dao/repo-dao';
import {ItemRecommendations} from './services/item-recommendations';
import {Markdown} from './services/markdown';
import {Remover} from './services/remover';
import {RepoIndexedDb} from './services/repo-indexed-db';
import {Updater} from './services/updater';
import {
  DeleteConfirmationModule
} from './shared/dialog/delete-confirmation/delete-confirmation.module';
import {HeaderModule} from './shared/header/header.module';
import {NavModule} from './shared/nav/nav.module';


const routes: Routes = [{
  path: '',
  component: Repository,
  children: [
    {
      path: 'database',
      loadChildren: 'app/repository/database-page/database-page.module#DatabasePageModule'
    },
    {
      path: 'dashboards',
      loadChildren: 'app/repository/dashboards-page/dashboards-page.module#DashboardsPageModule'
    },
    {
      path: 'dashboard/:id',
      loadChildren: 'app/repository/dashboard-page/dashboard-page.module#DashboardPageModule'
    },
    {
      path: 'queries/:type',
      loadChildren: 'app/repository/queries-page/queries-page.module#QueriesPageModule'
    },
    {
      path: 'query/:id',
      loadChildren: 'app/repository/query-page/query-page.module#QueryPageModule'
    },
    {
      path: 'config',
      loadChildren: 'app/repository/config-page/config-page.module#ConfigPageModule'
    },

    {path: '', redirectTo: 'queries/issue', pathMatch: 'full'},
  ]
}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class RepositoryRoutingModule {
}

const DaoList = [
  ItemsDao,
  LabelsDao,
  ContributorsDao,
  QueriesDao,
  RecommendationsDao,
  DashboardsDao,
  RepoIndexedDb,
];

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    NavModule,
    HeaderModule,
    RouterModule,
    RepositoryRoutingModule,
    DeleteConfirmationModule,
  ],
  declarations: [Repository],
  exports: [Repository],
  providers: [
    Header, Updater, Remover, ItemRecommendations, Markdown, ActivatedRepository, RepoDao,
    ...DaoList
  ]
})
export class RepositoryModule {
}
