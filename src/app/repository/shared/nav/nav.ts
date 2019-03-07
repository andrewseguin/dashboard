import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {MatSidenav} from '@angular/material';
import {Router} from '@angular/router';
import {ActivatedRepository} from 'app/repository/services/activated-repository';
import {Theme} from 'app/repository/services/theme';
import {Updater} from 'app/repository/services/updater';
import {UsersDao} from 'app/service/users-dao';
import {Observable, Subject} from 'rxjs';
import {filter, mergeMap} from 'rxjs/operators';

export interface NavLink {
  route: string;
  label: string;
  icon: string;
  permissions?: Observable<boolean>;
}

@Component({
  selector: 'nav-content',
  templateUrl: 'nav.html',
  styleUrls: ['nav.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Nav {
  repo = 'angular/material2';

  user = this.afAuth.authState.pipe(
      filter(auth => !!auth), mergeMap(auth => this.usersDao.get(auth.uid)));
  isUserProfileExpanded = false;

  links: NavLink[] = [
    {route: 'dashboards', label: 'Dashboards', icon: 'dashboard'},
    {route: 'issue-queries/issue', label: 'Issues', icon: 'find_in_page'},
    {route: 'issue-queries/pr', label: 'Pull Requests', icon: 'call_merge'},
    {route: 'config', label: 'Config', icon: 'settings'},
  ];

  @Input() sidenav: MatSidenav;

  private destroyed = new Subject();

  constructor(
      public afAuth: AngularFireAuth, public usersDao: UsersDao,
      public activatedRepository: ActivatedRepository, public cd: ChangeDetectorRef,
      public theme: Theme, public router: Router, public updater: Updater) {}

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  updateCache() {
    this.updater.updateLabels(this.repo);
    this.updater.updateContributors(this.repo);
    this.updater.updateIssues(this.repo);
  }
}
