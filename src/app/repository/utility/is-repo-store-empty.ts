import {combineLatest} from 'rxjs';
import {map} from 'rxjs/operators';
import {DataStore} from '../services/dao/data-dao';

/** Whether the store contains repo data (labels, items, contributors) */
export function isRepoStoreEmpty(store: DataStore) {
  return combineLatest(store.labels.list, store.items.list, store.contributors.list)
      .pipe(map(results => {
        const labels = results[0];
        const items = results[1];
        const contributors = results[2];
        return !labels.length && !items.length && !contributors.length;
      }));
}
