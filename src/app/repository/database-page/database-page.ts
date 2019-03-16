import {ChangeDetectionStrategy, Component} from '@angular/core';
import {LoadedRepos} from 'app/service/loaded-repos';
import {map, mergeMap} from 'rxjs/operators';
import {ActiveRepo} from '../services/active-repo';
import {Dao} from '../services/dao/dao';
import {Remover} from '../services/remover';
import {isRepoStoreEmpty} from '../utility/is-repo-store-empty';


@Component({
  selector: 'database-page',
  styleUrls: ['database-page.scss'],
  templateUrl: 'database-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatabasePage {
  isEmpty = this.activeRepo.change.pipe(
      mergeMap(activeRepo => isRepoStoreEmpty(this.dao.get(activeRepo))));

  isLoaded = this.activeRepo.change.pipe(map(activeRepo => this.loadedRepos.isLoaded(activeRepo)));

  repoLabels = this.activeRepo.change.pipe(
      mergeMap(repository => {
        return this.dao.get(repository).labels.list;
      }),
      map(labels => labels.map(l => l.id)));

  store = this.activeRepo.change.pipe(map(activeRepo => this.dao.get(activeRepo)));

  constructor(
      public activeRepo: ActiveRepo, private loadedRepos: LoadedRepos, public dao: Dao,
      public remover: Remover) {}
}
