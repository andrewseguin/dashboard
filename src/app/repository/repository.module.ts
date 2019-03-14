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
import {DaoState} from './services/dao/dao-state';
import {ItemRecommendations} from './services/item-recommendations';
import {Markdown} from './services/markdown';
import {Remover} from './services/remover';
import {RepoGist} from './services/repo-gist';
import {RepoIndexedDb} from './services/repo-indexed-db';
import {Updater} from './services/updater';
import {
  DeleteConfirmationModule
} from './shared/dialog/delete-confirmation/delete-confirmation.module';
import {HeaderModule} from './shared/header/header.module';
import {NavModule} from './shared/nav/nav.module';
import { ConfirmConfigUpdatesModule } from './shared/dialog/confirm-config-updates/confirm-config-updates.module';


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
      path: 'recommendations',
      loadChildren: 'app/repository/recommendations-page/' +
          'recommendations-page.module#RecommendationsPageModule'
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
    ConfirmConfigUpdatesModule,
  ],
  declarations: [Repository],
  exports: [Repository],
  providers: [
    Header, Updater, Remover, ItemRecommendations, Markdown, ActivatedRepository, DaoState,
    RepoGist, ...DaoList
  ]
})
export class RepositoryModule {
}
