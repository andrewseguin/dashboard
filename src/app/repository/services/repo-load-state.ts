import {Injectable} from '@angular/core';
import {LoadedRepos} from 'app/service/loaded-repos';
import {combineLatest} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {ActiveRepo} from './active-repo';
import {Dao, RepoStore} from './dao/dao';

export type RepoDaoType = 'items'|'labels'|'contributors';

@Injectable()
export class RepoLoadState {
  store = this.activeRepo.change.pipe(map(r => this.dao.get(r)));

  isLoaded = combineLatest(this.activeRepo.change, this.loadedRepos.repos$)
                 .pipe(map(results => this.loadedRepos.isLoaded(results[0]!)));

  constructor(private activeRepo: ActiveRepo, private loadedRepos: LoadedRepos, private dao: Dao) {}
}

export function isRepoStoreEmpty(store: RepoStore) {
  return combineLatest(store.labels.list, store.items.list, store.contributors.list)
      .pipe(filter(results => results.every(v => !!v)), map(results => {
              const labels = results[0]!;
              const items = results[1]!;
              const contributors = results[2]!;
              return !labels.length && !items.length && !contributors.length;
            }));
}
