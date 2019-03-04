import {CdkPortal} from '@angular/cdk/portal';
import {Injectable} from '@angular/core';
import {Title as WindowTitle} from '@angular/platform-browser';
import {NavigationEnd, Router} from '@angular/router';
import {Subject} from 'rxjs';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {filter, take, takeUntil} from 'rxjs/operators';

import {ActivatedRepository} from './activated-repository';
import {IssueQueriesDao} from './dao/issue-queries-dao';

const SECTIONS = new Map<string, string>([['issue-queries', 'Issue Queries']]);


@Injectable()
export class Header {
  goBack: () => void | null;

  title = new BehaviorSubject<string>('Loading...');

  toolbarOutlet = new BehaviorSubject<CdkPortal>(null);

  destroyed = new Subject();

  constructor(
      private windowTitle: WindowTitle, private router: Router,
      private activatedRepository: ActivatedRepository) {
    this.title.pipe(takeUntil(this.destroyed))
        .subscribe(title => this.windowTitle.setTitle(title));
    this.router.events
        .pipe(
            filter(e => e instanceof NavigationEnd), takeUntil(this.destroyed))
        .subscribe((e: NavigationEnd) => {
          this.goBack = null;
          const section = e.urlAfterRedirects.split('/')[3];

          if (section === 'issue-query') {
            this.onIssueQueryRoute();
          } else {
            this.title.next(SECTIONS.get(section));
          }
        });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  onIssueQueryRoute() {
    const repository = this.activatedRepository.repository.value;
    this.goBack = () => this.router.navigate([`/${repository}/issue-queries`]);
  }
}
