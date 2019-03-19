import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ItemGroup} from './item-grouper';

export interface ItemSorterState<S> {
  sort: S|null;
  reverse: boolean;
}

export interface SortingMetadata<T, S, C> {
  id: S;
  label: string;
  comparator: (context: C) => ((a: T, b: T) => number);
}

export class ItemSorter<T, S, C> {
  state = new BehaviorSubject<ItemSorterState<S>>({sort: null, reverse: false});

  constructor(private context: Observable<C>, public metadata: Map<S, SortingMetadata<T, S, C>>) {}

  performSort(itemGroups: ItemGroup<T>[]): Observable<ItemGroup<T>[]> {
    return combineLatest(this.state, this.context).pipe(map(results => {
      const sort = results[0].sort;
      const reverse = results[0].reverse;
      const context = results[1];

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

  getState(): ItemSorterState<S> {
    return this.state.value;
  }

  setState(state: ItemSorterState<S>) {
    this.state.next({...state});
  }

  isEquivalent(otherState: ItemSorterState<S>) {
    const thisState = this.getState();
    return thisState.sort === otherState.sort && thisState.reverse === otherState.reverse;
  }
}
