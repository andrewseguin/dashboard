import {ChangeDetectionStrategy, Component} from '@angular/core';
import {filter, map, mergeMap} from 'rxjs/operators';
import {ActiveRepo} from '../services/active-repo';
import {Dao} from '../services/dao/dao';
import {Remover} from '../services/remover';
import {isRepoStoreEmpty, RepoLoadState} from '../services/repo-load-state';


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

  repoLabels = this.activeRepo.change.pipe(
      mergeMap(repository => {
        const store = this.dao.get(repository);
        return store.labels.list.pipe(filter(v => !!v));
      }),
      map(labels => labels!.map(l => l.id)));

  constructor(
      public activeRepo: ActiveRepo, public dao: Dao, public repoLoadState: RepoLoadState,
      public remover: Remover) {}
}
