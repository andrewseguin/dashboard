import 'hammerjs';

import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {AngularFireModule} from '@angular/fire';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {MatIconRegistry} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {Login} from 'app/login/login';
import {LoginModule} from 'app/login/login.module';
import {Theme} from 'app/repository/services/theme';
import {TimeAgoPipe} from 'time-ago-pipe';

import {App} from './app';
import {FIREBASE_CONFIG} from './firebase.config';
import {RateLimitReachedModule} from './service/rate-limit-reached/rate-limit-reached.module';


@NgModule({
  declarations: [TimeAgoPipe],
  exports: [TimeAgoPipe],
})
export class TimeAgoPipeModule {
}

@NgModule({
  declarations: [App],
  imports: [
    AngularFireModule.initializeApp(FIREBASE_CONFIG), AngularFireAuthModule, RateLimitReachedModule,
    BrowserAnimationsModule, LoginModule, HttpClientModule, RouterModule.forRoot([
      {path: 'login', component: Login},
      {path: ':org/:name', loadChildren: 'app/repository/repository.module#RepositoryModule'},
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'angular/material2',
      },
    ])
  ],
  providers: [
    MatIconRegistry,
    Theme,
  ],
  bootstrap: [App]
})
export class AppModule {
}
