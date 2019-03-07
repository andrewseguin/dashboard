import {CdkPortal} from '@angular/cdk/portal';
import {Injectable} from '@angular/core';
import {Title as WindowTitle} from '@angular/platform-browser';
import {NavigationEnd, Router} from '@angular/router';
import {Subject} from 'rxjs';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {filter, takeUntil} from 'rxjs/operators';

const TOP_LEVEL_SECTIONS = new Set<string>(['queries', 'config', 'dashboards']);

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
          const sections = e.urlAfterRedirects.split('/');
          const section = sections[3];
          const subSection = sections[4];

          switch (section) {
            case 'config':
              this.title.next('Config');
              break;
            case 'dashboards':
              this.title.next('Dashboards');
              break;
            case 'queries':
              this.title.next(
                  subSection === 'issue' ? 'Issue Queries' :
                                           subSection === 'pr' ? 'Pull Request Queries' : '');
              break;
          }

          if (TOP_LEVEL_SECTIONS.has(section)) {
            this.goBack = null;
          }
        });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
