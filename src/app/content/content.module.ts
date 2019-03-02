import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';
import {Content} from './content';
import {Header, Selection} from './services';
import {IssueRecommendations} from './services/issue-recommendations';
import {Markdown} from './services/markdown';
import {Updater} from './services/updater';
import {CreateStoreModule} from './shared/dialog/create-store/create-store.module';
import {HeaderModule} from './shared/header/header.module';
import {NavModule} from './shared/nav/nav.module';
import {SelectionHeaderModule} from './shared/selection-header/selection-header.module';


const routes: Routes = [{
  path: '',
  component: Content,
  children: [
    {
      path: 'home',
      loadChildren: 'app/content/home-page/home-page.module#HomePageModule'
    },
    {
      path: 'issues',
      loadChildren:
        'app/content/issues-page/issues-page.module#IssuesPageModule'
    },

    {path: '', redirectTo: 'issues', pathMatch: 'full'},
  ]
}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class ContentRoutingModule {
}

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    NavModule,
    HeaderModule,
    SelectionHeaderModule,
    RouterModule,
    ContentRoutingModule,
    CreateStoreModule,
  ],
  declarations: [Content],
  exports: [Content],
  providers: [
    Selection,
    Header,
    Updater,
    IssueRecommendations,
    Markdown,
  ]
})
export class ContentModule {
}
