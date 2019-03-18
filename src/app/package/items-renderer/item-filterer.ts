import {Filter, IFilterMetadata} from 'app/package/items-renderer/search-utility/filter';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export class ItemFilterer<T, M> {
  set filters(filters: Filter[]) {
    this.filters$.next(filters);
  }
  get filters(): Filter[] {
    return this.filters$.value;
  }
  filters$ = new BehaviorSubject<Filter[]>([]);

  set search(search: string) {
    this.search$.next(search);
  }
  get search(): string {
    return this.search$.value;
  }
  search$ = new BehaviorSubject<string>('');

  constructor(
      private contextProvider: Observable<(item: T) => M>, public tokenizeItem: (item: T) => string,
      public metadata: Map<string, IFilterMetadata<M, any>>) {}

  /** Gets a stream that returns the items and updates whenever the filters or search changes. */
  filterItems(items: T[]): Observable<T[]> {
    return combineLatest(this.filters$, this.search$, this.contextProvider).pipe(map(results => {
      const filters = results[0];
      const search = results[1];
      const contextProvider = results[2];

      const filteredItems = filterItems(items, filters, contextProvider, this.metadata);
      return searchItems(filteredItems, search, this.tokenizeItem);
    }));
  }
}


/** Utility function to filter the items. May be used to synchronously filter items. */
export function filterItems<T, M>(
    items: T[], filters: Filter[] = [], contextProvider: (item: T) => M,
    metadata: Map<string, IFilterMetadata<M, any>>) {
  return items.filter(item => {
    return filters.every(filter => {
      if (!filter.query) {
        return true;
      }

      const context = contextProvider(item);
      const filterConfig = metadata.get(filter.type);

      if (filterConfig && filterConfig.matcher) {
        return filterConfig.matcher(context, filter.query);
      } else {
        throw Error('Missing matcher for ' + filter.type);
      }
    });
  });
}

export function searchItems<T>(items: T[], search: string, tokenizeItem: (item: T) => string): T[] {
  return !search ? items : items.filter(item => {
    const tokens = search.split(' OR ');
    return tokens.some(token => {
      return tokenizeItem(item).indexOf(token.toLowerCase()) != -1;
    });
  });
}
