import {combineLatest} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {RepoStore} from '../services/dao/dao';

/** Whether the store contains repo data (labels, items, contributors) */
export function isRepoStoreEmpty(store: RepoStore) {
  return combineLatest(store.labels.list, store.items.list, store.contributors.list)
      .pipe(filter(results => results.every(v => !!v)), map(results => {
              const labels = results[0]!;
              const items = results[1]!;
              const contributors = results[2]!;
              return !labels.length && !items.length && !contributors.length;
            }));
}
