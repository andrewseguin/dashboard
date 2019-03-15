import {combineLatest} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {RepoStore} from './dao/dao';

export type RepoDaoType = 'items'|'labels'|'contributors';

export function isRepoStoreEmpty(store: RepoStore) {
  return combineLatest(store.labels.list, store.items.list, store.contributors.list)
      .pipe(filter(results => results.every(v => !!v)), map(results => {
              const labels = results[0]!;
              const items = results[1]!;
              const contributors = results[2]!;
              return !labels.length && !items.length && !contributors.length;
            }));
}
