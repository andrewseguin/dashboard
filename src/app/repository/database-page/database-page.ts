import {ChangeDetectionStrategy, Component} from '@angular/core';
import {LoadedRepos} from 'app/service/loaded-repos';
import {filter, map, mergeMap} from 'rxjs/operators';
import {ActiveRepo} from '../services/active-repo';
import {Dao} from '../services/dao/dao';
import {Remover} from '../services/remover';
import {isRepoStoreEmpty} from '../services/repo-load-state';


@Component({
  selector: 'database-page',
  styleUrls: ['database-page.scss'],
  templateUrl: 'database-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatabasePage {
  isEmpty = this.activeRepo.change.pipe(map(repository => {
    const store = this.dao.get(repository);
    return isRepoStoreEmpty(store);
  }));

  isLoaded = this.activeRepo.change.pipe(map(activeRepo => this.loadedRepos.isLoaded(activeRepo)));

  repoLabels = this.activeRepo.change.pipe(
      mergeMap(repository => {
        const store = this.dao.get(repository);
        return store.labels.list.pipe(filter(v => !!v));
      }),
      map(labels => labels!.map(l => l.id)));

  store = this.activeRepo.change.pipe(map(activeRepo => this.dao.get(activeRepo)));

  constructor(
      public activeRepo: ActiveRepo, private loadedRepos: LoadedRepos, public dao: Dao,
      public remover: Remover) {}
}
