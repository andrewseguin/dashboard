import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Group} from './grouper';

export interface SorterState<S> {
  sort: S|null;
  reverse: boolean;
}

export interface SortingMetadata<T, S, C> {
  id: S;
  label: string;
  comparator: (context: C) => ((a: T, b: T) => number);
}

export type SorterContextProvider<C> = Observable<C>;

export class Sorter<T = any, S = any, C = any> {
  state = new BehaviorSubject<SorterState<S>>({sort: null, reverse: false});

  constructor(
      public metadata: Map<S, SortingMetadata<T, S, C>>,
      private contextProvider: SorterContextProvider<C>) {}

  sort(): (itemGroups: Observable<Group<T>[]>) => Observable<Group<T>[]> {
    return (itemGroups: Observable<Group<T>[]>) => {
      return combineLatest(itemGroups, this.state, this.contextProvider).pipe(map(results => {
        const itemGroups = results[0];
        const sort = results[1].sort;
        const reverse = results[1].reverse;
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
    };
  }

  getSorts(): SortingMetadata<T, S, C>[] {
    const sorts: SortingMetadata<T, S, C>[] = [];
    this.metadata.forEach(sort => sorts.push(sort));
    return sorts;
  }

  getState(): SorterState<S> {
    return this.state.value;
  }

  setState(state: SorterState<S>) {
    this.state.next({...state});
  }

  isEquivalent(otherState: SorterState<S>) {
    const thisState = this.getState();
    return thisState.sort === otherState.sort && thisState.reverse === otherState.reverse;
  }
}
