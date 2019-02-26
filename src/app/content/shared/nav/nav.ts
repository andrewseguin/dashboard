import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {MatSidenav} from '@angular/material';
import {Router} from '@angular/router';
import {Theme} from 'app/content/services/theme';
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
  user = this.afAuth.authState.pipe(
      filter(auth => !!auth), mergeMap(auth => this.usersDao.get(auth.uid)));
  isUserProfileExpanded = false;

  links: NavLink[] = [
    {route: '/home', label: 'Home', icon: 'home'},
    {route: '/another-page', label: 'another-page', icon: 'home'},
  ];

  @Input() sidenav: MatSidenav;

  private destroyed = new Subject();

  constructor(
      public afAuth: AngularFireAuth, public usersDao: UsersDao,
      public cd: ChangeDetectorRef, public theme: Theme,
      public router: Router) {}

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
