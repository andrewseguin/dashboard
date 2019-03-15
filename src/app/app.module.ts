import 'hammerjs';

import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {AngularFireModule} from '@angular/fire';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {MatIconRegistry} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  RouteReuseStrategy,
  RouterModule
} from '@angular/router';
import {HomePage} from 'app/home-page/home-page';
import {LoginModule} from 'app/home-page/home-page.module';
import {Theme} from 'app/repository/services/theme';
import {TimeAgoPipe} from 'time-ago-pipe';

import {App} from './app';
import {FIREBASE_CONFIG} from './firebase.config';
import {Repository} from './repository/repository';
import {LoginDialogModule} from './service/login-dialog/login-dialog.module';
import {RateLimitReachedModule} from './service/rate-limit-reached/rate-limit-reached.module';


@NgModule({
  declarations: [TimeAgoPipe],
  exports: [TimeAgoPipe],
})
export class TimeAgoPipeModule {
}

export class CustomRouteReuseStrategy {
  shouldDetach(_route: ActivatedRouteSnapshot): boolean {
    return false;
  }
  store(_route: ActivatedRouteSnapshot, _detachedTree: DetachedRouteHandle): void {}
  shouldAttach(_route: ActivatedRouteSnapshot): boolean {
    return false;
  }
  retrieve(_route: ActivatedRouteSnapshot): DetachedRouteHandle|null {
    return null;
  }
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    // By not reusing the Repository module, its services can safely assume they are concerned with
    // a single repository and not worry that the Dao objects cross between repositories.
    if (future.component === Repository) {
      // return false;
    }

    return future.routeConfig === curr.routeConfig;
  }
}

@NgModule({
  declarations: [App],
  imports: [
    AngularFireModule.initializeApp(FIREBASE_CONFIG), AngularFireAuthModule, RateLimitReachedModule,
    LoginDialogModule, BrowserAnimationsModule, LoginModule, HttpClientModule,
    RouterModule.forRoot([
      {path: '', component: HomePage},
      {path: ':org/:name', loadChildren: 'app/repository/repository.module#RepositoryModule'},
    ])
  ],
  providers:
      [MatIconRegistry, Theme, {provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy}],
  bootstrap: [App]
})
export class AppModule {
}
