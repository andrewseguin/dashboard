import {CdkPortal} from '@angular/cdk/portal';
import {Injectable} from '@angular/core';
import {Title as WindowTitle} from '@angular/platform-browser';
import {NavigationEnd, Router} from '@angular/router';
import {Subject} from 'rxjs';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {filter, takeUntil} from 'rxjs/operators';

const SECTIONS = new Map<string, string>(
  [['home', 'Home'], ['pre-triage', 'Pretriage']]);


@Injectable()
export class Header {
  title = new BehaviorSubject<string>('Loading...');

  toolbarOutlet = new BehaviorSubject<CdkPortal>(null);

  destroyed = new Subject();

  constructor(private windowTitle: WindowTitle, private router: Router) {
    this.title.pipe(takeUntil(this.destroyed))
      .subscribe(title => this.windowTitle.setTitle(title));
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd), takeUntil(this.destroyed))
      .subscribe((e: NavigationEnd) => {
        const section = e.urlAfterRedirects.split('/')[1];
        this.title.next(SECTIONS.get(section));
      });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
