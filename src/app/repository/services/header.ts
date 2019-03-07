import {CdkPortal} from '@angular/cdk/portal';
import {Injectable} from '@angular/core';
import {Title as WindowTitle} from '@angular/platform-browser';
import {NavigationEnd, Router} from '@angular/router';
import {Subject} from 'rxjs';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {filter, takeUntil} from 'rxjs/operators';

const SECTIONS = new Map<string, string>(
    [['issue-queries', 'Issue Queries'], ['config', 'Config'], ['dashboards', 'Dashboards']]);

@Injectable()
export class Header {
  goBack: () => void | null;

  title = new BehaviorSubject<string>('Loading...');

  toolbarOutlet = new BehaviorSubject<CdkPortal>(null);

  destroyed = new Subject();

  constructor(private windowTitle: WindowTitle, private router: Router) {
    this.title.pipe(takeUntil(this.destroyed)).subscribe(title => this.windowTitle.setTitle(title));
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), takeUntil(this.destroyed))
        .subscribe((e: NavigationEnd) => {
          const section = e.urlAfterRedirects.split('/')[3];
          if (SECTIONS.get(section)) {
            this.title.next(SECTIONS.get(section));
            this.goBack = null;
          }
        });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
