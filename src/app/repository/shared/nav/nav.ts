import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatSidenav} from '@angular/material';
import {Router} from '@angular/router';
import {ActivatedRepository} from 'app/repository/services/activated-repository';
import {DaoState} from 'app/repository/services/dao/dao-state';
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
    {route: 'recommendations', label: 'Recommendations', icon: 'label', requiresData: true},
  ];

  repository = new FormControl();

  repositories = this.activatedRepository.repository.pipe(map(repository => {
    if (repository && this.loadedRepos.repos.indexOf(repository) === -1) {
      return [repository, ...this.loadedRepos.repos];
    } else {
      return this.loadedRepos.repos;
    }
  }));

  @Input() sidenav: MatSidenav;

  private destroyed = new Subject();

  constructor(
      public activatedRepository: ActivatedRepository, public loadedRepos: LoadedRepos,
      public daoState: DaoState, public cd: ChangeDetectorRef, public theme: Theme,
      public router: Router, public auth: Auth, public updater: Updater) {
    this.activatedRepository.repository.pipe(filter(v => !!v), takeUntil(this.destroyed))
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
