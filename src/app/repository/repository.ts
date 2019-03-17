import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Router} from '@angular/router';
import {Auth} from 'app/service/auth';
import {LoadedRepos} from 'app/service/loaded-repos';
import {interval, Subject} from 'rxjs';
import {filter, mergeMap, take} from 'rxjs/operators';
import {ActiveRepo} from './services/active-repo';
import {Dao} from './services/dao/dao';
import {Remover} from './services/remover';
import {Updater} from './services/updater';
import {isRepoStoreEmpty} from './utility/is-repo-store-empty';


@Component({
  templateUrl: 'repository.html',
  styleUrls: ['repository.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Repository {
  destroyed = new Subject();

  constructor(
      private router: Router, private updater: Updater, private loadedRepos: LoadedRepos,
      private dao: Dao, private remover: Remover, private activeRepo: ActiveRepo,
      private auth: Auth) {
    this.activeRepo.repository
        .pipe(mergeMap(activeRepo => isRepoStoreEmpty(this.dao.get(activeRepo)).pipe(take(1))))
        .subscribe(isEmpty => {
          const isLoaded = this.loadedRepos.isLoaded(this.activeRepo.activeRepository);

          if (!isEmpty && !isLoaded) {
            this.remover.removeAllData(false);
          }

          if (isEmpty) {
            this.router.navigate([`${this.activeRepo.activeRepository}/database`]);
          } else if (this.auth.token) {
            this.initializeAutoIssueUpdates(this.activeRepo.activeRepository);
          }
        });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private initializeAutoIssueUpdates(repository: string) {
    const store = this.dao.get(repository);
    interval(60 * 1000)
        .pipe(
            mergeMap(() => store.items.list.pipe(take(1))),
            filter(items => items.length > 0))
        .subscribe(() => {
          this.updater.update(repository, 'items');
        });
    this.updater.update(repository, 'contributors');
    this.updater.update(repository, 'labels');
  }
}
