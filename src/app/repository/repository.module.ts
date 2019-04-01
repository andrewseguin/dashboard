import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';
import {Repository} from './repository';
import {ActiveStore} from './services/active-store';
import {ConfigDao} from './services/dao/config/config-dao';
import {Dao} from './services/dao/data-dao';
import {Header} from './services/header';
import {Markdown} from './services/markdown';
import {Remover} from './services/remover';
import {RepoGist} from './services/repo-gist';
import {Updater} from './services/updater';
import {
  ConfirmConfigUpdatesModule
} from './shared/dialog/confirm-config-updates/confirm-config-updates.module';
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
      loadChildren: 'app/repository/database-page/database-page.module#DatabasePageModule',
    },
    {
      path: 'dashboards',
      loadChildren: 'app/repository/dashboards-page/dashboards-page.module#DashboardsPageModule',
    },
    {
      path: 'dashboard/:id',
      loadChildren: 'app/repository/dashboard-page/dashboard-page.module#DashboardPageModule',
    },
    {
      path: 'queries',
      loadChildren: 'app/repository/queries-page/queries-page.module#QueriesPageModule',
    },
    {
      path: 'query/:id',
      loadChildren: 'app/repository/query-page/query-page.module#QueryPageModule',
    },
    {
      path: 'recommendations',
      loadChildren: 'app/repository/recommendations-page/' +
          'recommendations-page.module#RecommendationsPageModule',
    },

    {path: '', redirectTo: 'database', pathMatch: 'full'},
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
    RouterModule,
    RepositoryRoutingModule,
    DeleteConfirmationModule,
    ConfirmConfigUpdatesModule,
  ],
  declarations: [Repository],
  exports: [Repository],
  providers: [Dao, ConfigDao, Header, Updater, Remover, Markdown, ActiveStore, RepoGist]
})
export class RepositoryModule {
}
