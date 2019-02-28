import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';
import {Content} from './content';
import {Header, Selection} from './services';
import {HeaderModule} from './shared/header/header.module';
import {NavModule} from './shared/nav/nav.module';
import {SelectionHeaderModule} from './shared/selection-header/selection-header.module';
import {Updater} from './services/updater';
import {CreateStoreModule} from './shared/dialog/create-store/create-store.module';


const routes: Routes = [{
  path: '',
  component: Content,
  children: [
    {
      path: 'home',
      loadChildren: 'app/content/home-page/home-page.module#HomePageModule'
    },
    {
      path: 'pre-triage',
      loadChildren:
        'app/content/pre-triage-page/pre-triage-page.module#PreTriagePageModule'
    },

    {path: '', redirectTo: 'home', pathMatch: 'full'},
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
  ]
})
export class ContentModule {
}
