import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatSidenav} from '@angular/material';
import {Router} from '@angular/router';
import {ActiveStore} from 'app/repository/services/active-repo';
import {Theme} from 'app/repository/services/theme';
import {Updater} from 'app/repository/services/updater';
import {Auth} from 'app/service/auth';
import {LoadedRepos} from 'app/service/loaded-repos';
import {Subject} from 'rxjs';
import {filter, map, takeUntil} from 'rxjs/operators';

export interface NavLink {
  route: string;
  label: string;
  icon: string;
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
    {route: 'dashboards', label: 'Dashboards', icon: 'dashboard'},
    {route: 'queries/issue', label: 'Issues', icon: 'find_in_page'},
    {route: 'queries/pr', label: 'Pull Requests', icon: 'call_merge'},
    {route: 'recommendations', label: 'Recommendations', icon: 'label'},
  ];

  repository = new FormControl();

  repositories = this.activeRepo.name.pipe(map(repository => {
    if (repository && this.loadedRepos.repos.indexOf(repository) === -1) {
      return [repository, ...this.loadedRepos.repos];
    } else {
      return this.loadedRepos.repos;
    }
  }));

  @Input() sidenav: MatSidenav;

  private destroyed = new Subject();

  constructor(
      public activeRepo: ActiveStore, public loadedRepos: LoadedRepos, public theme: Theme,
      public router: Router, public auth: Auth, public updater: Updater) {
    this.activeRepo.name.pipe(filter(v => !!v), takeUntil(this.destroyed))
        .subscribe(repository => this.repository.setValue(repository));

    this.repository.valueChanges.pipe(takeUntil(this.destroyed)).subscribe(repository => {
      this.router.navigate([repository]);
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
