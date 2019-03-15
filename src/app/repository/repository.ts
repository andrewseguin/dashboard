import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Router} from '@angular/router';
import {Auth} from 'app/service/auth';
import {LoadedRepos} from 'app/service/loaded-repos';
import {interval, Subject} from 'rxjs';
import {filter, mergeMap, take} from 'rxjs/operators';
import {ActiveRepo} from './services/active-repo';
import {Dao} from './services/dao/dao';
import {Remover} from './services/remover';
import {RepoGist} from './services/repo-gist';
import {isRepoStoreEmpty} from './services/repo-load-state';
import {Updater} from './services/updater';


@Component({
  templateUrl: 'repository.html',
  styleUrls: ['repository.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Repository {
  destroyed = new Subject();

  constructor(
      private router: Router, private updater: Updater, private loadedRepos: LoadedRepos,
      private dao: Dao, private repoGist: RepoGist, private remover: Remover,
      private activeRepo: ActiveRepo, private auth: Auth) {
    // Sync from Github Gist, then begin saving any changes to the IndexedDB
    this.repoGist.sync().then(() => this.repoGist.saveChanges());

    this.activeRepo.change.subscribe(activeRepo => {
      const isEmpty = isRepoStoreEmpty(this.dao.get(activeRepo));
      const isLoaded = this.loadedRepos.isLoaded(activeRepo);

      if (!isEmpty && !isLoaded) {
        this.remover.removeAllData(false);
      }

      if (isEmpty) {
        this.router.navigate([`${activeRepo}/database`]);
      } else if (this.auth.token) {
        this.initializeAutoIssueUpdates(activeRepo);
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
            filter(items => !!items && items.length > 0))
        .subscribe(() => {
          this.updater.update(repository, 'items');
        });
    this.updater.update(repository, 'contributors');
    this.updater.update(repository, 'labels');
  }
}
