import 'hammerjs';

import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {AngularFireModule} from '@angular/fire';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {AngularFirestoreModule, FirestoreSettingsToken} from '@angular/fire/firestore';
import {MatIconRegistry} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {Login} from 'app/login/login';
import {LoginModule} from 'app/login/login.module';
import {Theme} from 'app/repository/services/theme';
import {GlobalConfigDao} from 'app/service/global-config-dao';
import {TimeAgoPipe} from 'time-ago-pipe';

import {App} from './app';
import {FIREBASE_CONFIG} from './firebase.config';
import {RepoDao} from './service/repo-dao';
import {UsersDao} from './service/users-dao';

@NgModule({
  declarations: [TimeAgoPipe],
  exports: [TimeAgoPipe],
})
export class TimeAgoPipeModule {
}

@NgModule({
  declarations: [App],
  imports: [
    AngularFireModule.initializeApp(FIREBASE_CONFIG),
    AngularFireAuthModule,
    AngularFirestoreModule,
    BrowserAnimationsModule,
    LoginModule,
    HttpClientModule,
    RouterModule.forRoot(
        [
          {path: 'login', component: Login},
          {
            path: ':org/:name',
            loadChildren: 'app/repository/repository.module#RepositoryModule'
          },
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'angular/material2',
          },
        ],
        {enableTracing: true}),
  ],
  providers: [
    MatIconRegistry,
    UsersDao,
    GlobalConfigDao,
    Theme,
    RepoDao,
    {provide: FirestoreSettingsToken, useValue: {}},
  ],
  bootstrap: [App]
})
export class AppModule {
}
