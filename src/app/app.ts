import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {distinctUntilChanged} from 'rxjs/operators';
import {Auth} from './service/auth';
import {sendPageview} from './utility/analytics';


@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'theme-text',
  }
})
export class App {
  constructor(private router: Router, private auth: Auth) {
    this.router.events
        .pipe(distinctUntilChanged((prev: any, curr: any) => {
          if (curr instanceof NavigationEnd) {
            return prev.urlAfterRedirects === curr.urlAfterRedirects;
          }
          return true;
        }))
        .subscribe(x => sendPageview(x.urlAfterRedirects));

    this.auth.token$.subscribe(token => {
      if (!token) {
        this.navigateToLogin();
      }
    });
  }

  /**
   * Send user to the login page and send current location for when they are
   * logged in.
   */
  private navigateToLogin() {
    if (location.pathname !== '/login') {
      this.router.navigate(['login'], {fragment: location.pathname});
    }
  }
}
