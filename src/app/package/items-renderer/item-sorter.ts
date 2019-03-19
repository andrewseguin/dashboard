import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ItemGroup} from './item-grouping';

export interface SortingMetadata<T, S, C> {
  id: S;
  label: string;
  comparator: (context: C) => ((a: T, b: T) => number);
}

export class ItemSorter<T, S, C> {
  set sort(sort: S|null) {
    this.sort$.next(sort);
  }
  get sort(): S|null {
    return this.sort$.value;
  }
  sort$ = new BehaviorSubject<S|null>(null);

  set reverse(reverse: boolean) {
    this.reverse$.next(reverse);
  }
  get reverse(): boolean {
    return this.reverse$.value;
  }
  reverse$ = new BehaviorSubject<boolean>(false);

  constructor(private context: Observable<C>, public metadata: Map<S, SortingMetadata<T, S, C>>) {}

  performSort(itemGroups: ItemGroup<T>[]): Observable<ItemGroup<T>[]> {
    return combineLatest(this.sort$, this.reverse$, this.context).pipe(map(results => {
      const sort = results[0];
      const reverse = results[1];
      const context = results[2];

      if (!sort) {
        return itemGroups;
      }

      const itemSort = this.metadata.get(sort);
      if (!itemSort) {
        throw new Error(`No configuration set up for sort ${sort}`);
      }

      if (itemSort.comparator) {
        itemGroups.forEach(itemGroup => {
          itemGroup.items.sort(itemSort.comparator(context));

          if (reverse) {
            itemGroup.items.reverse();
          }
        });
      }

      return itemGroups;
    }));
  }

  getSorts(): SortingMetadata<T, S, C>[] {
    const sorts: SortingMetadata<T, S, C>[] = [];
    this.metadata.forEach(sort => sorts.push(sort));
    return sorts;
  }
}
