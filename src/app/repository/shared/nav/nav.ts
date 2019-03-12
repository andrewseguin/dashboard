import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {MatSidenav} from '@angular/material';
import {Router} from '@angular/router';
import {ActivatedRepository} from 'app/repository/services/activated-repository';
import {DaoState} from 'app/repository/services/dao/dao-state';
import {Theme} from 'app/repository/services/theme';
import {Updater} from 'app/repository/services/updater';
import {Auth} from 'app/service/auth';

export interface NavLink {
  route: string;
  label: string;
  icon: string;
  requiresData?: boolean;
}

@Component({
  selector: 'nav-content',
  templateUrl: 'nav.html',
  styleUrls: ['nav.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Nav {
  isUserProfileExpanded = false;

  links: NavLink[] = [
    {route: 'database', label: 'Database', icon: 'archive'},
    {route: 'dashboards', label: 'Dashboards', icon: 'dashboard', requiresData: true},
    {route: 'queries/issue', label: 'Issues', icon: 'find_in_page', requiresData: true},
    {route: 'queries/pr', label: 'Pull Requests', icon: 'call_merge', requiresData: true},
    {route: 'config', label: 'Config', icon: 'settings', requiresData: true},
  ];

  @Input() sidenav: MatSidenav;

  constructor(
      public afAuth: AngularFireAuth, public activatedRepository: ActivatedRepository,
      public daoState: DaoState, public cd: ChangeDetectorRef, public theme: Theme,
      public router: Router, public auth: Auth, public updater: Updater) {}
}
