import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {MatSidenav} from '@angular/material';
import {Router} from '@angular/router';
import {ActivatedRepository} from 'app/repository/services/activated-repository';
import {Theme} from 'app/repository/services/theme';
import {Updater} from 'app/repository/services/updater';
import {Auth} from 'app/service/auth';
import {RepoDao} from 'app/repository/services/repo-dao';
import {auth} from 'firebase/app';
import {Subject} from 'rxjs';

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
  repo = 'angular/material2';
  isUserProfileExpanded = false;

  links: NavLink[] = [
    {route: 'database', label: 'Database', icon: 'archive'},
    {route: 'dashboards', label: 'Dashboards', icon: 'dashboard', requiresData: true},
    {route: 'queries/issue', label: 'Issues', icon: 'find_in_page', requiresData: true},
    {route: 'queries/pr', label: 'Pull Requests', icon: 'call_merge', requiresData: true},
    {route: 'config', label: 'Config', icon: 'settings', requiresData: true},
  ];

  @Input() sidenav: MatSidenav;

  private destroyed = new Subject();

  constructor(
      public afAuth: AngularFireAuth, public activatedRepository: ActivatedRepository,
      public repoDao: RepoDao, public cd: ChangeDetectorRef, public theme: Theme,
      public router: Router, private auth: Auth, public updater: Updater) {}

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  updateCache() {
    this.updater.updateLabels(this.repo);
    this.updater.updateContributors(this.repo);
    this.updater.updateIssues(this.repo);
  }

  signOut() {
    this.afAuth.auth.signOut();
    this.auth.token = '';
  }

  loginWithGithub() {
    const googleAuthProvider = new auth.GoogleAuthProvider();
    googleAuthProvider.setCustomParameters({prompt: 'select_account'});
    this.afAuth.auth.signInWithPopup(googleAuthProvider);
  }
}
