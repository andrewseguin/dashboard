import {Filter, IFilterMetadata} from 'app/package/items-renderer/search-utility/filter';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export interface FiltererState {
  filters: Filter[];
  search: string;
}

export class Filterer<T, M, A> {
  state = new BehaviorSubject<FiltererState>({filters: [], search: ''});

  /**
   * Context given to a filters to provide autocomplete suggestions. Probably should be a stream?
   */
  autocompleteContext: A;

  // TODO: Needs to be noted somewhere that the context provider should not have a dependency that
  // listens for the data given by the provider, else the context will fire simultaneously with the
  // data provider and way too many events will emit
  constructor(
      private contextProvider: Observable<(item: T) => M>, public tokenizeItem: (item: T) => string,
      public metadata: Map<string, IFilterMetadata<M, any>>) {}

  /** Gets a stream that returns the items and updates whenever the filters or search changes. */
  filter(items: T[]): Observable<T[]> {
    return combineLatest(this.state, this.contextProvider).pipe(map(results => {
      const filters = results[0].filters;
      const search = results[0].search;
      const contextProvider = results[1];

      const filteredItems = filterItems(items, filters, contextProvider, this.metadata);
      return searchItems(filteredItems, search, this.tokenizeItem);
    }));
  }

  getState(): FiltererState {
    return this.state.value;
  }

  setState(state: FiltererState) {
    this.state.next({...state});
  }

  isEquivalent(otherState: FiltererState) {
    const thisState = this.getState();

    const filtersEquivalent =
        JSON.stringify(thisState.filters.sort()) === JSON.stringify(otherState.filters.sort());
    const searchEquivalent = thisState.search === otherState.search;

    return filtersEquivalent && searchEquivalent;
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
