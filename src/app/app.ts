import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {distinctUntilChanged} from 'rxjs/operators';
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
  constructor(private router: Router) {
    this.router.events
        .pipe(distinctUntilChanged((prev: any, curr: any) => {
          if (curr instanceof NavigationEnd) {
            return prev.urlAfterRedirects === curr.urlAfterRedirects;
          }
          return true;
        }))
        .subscribe(x => sendPageview(x.urlAfterRedirects));
  }
}
