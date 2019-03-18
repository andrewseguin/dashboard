import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, of, ReplaySubject, Subscription} from 'rxjs';
import {filter, map, mergeMap, startWith, tap} from 'rxjs/operators';
import {ItemFilterer} from './item-filterer';
import {ItemGroup, ItemGrouping} from './item-grouping';
import {ItemRendererOptions} from './item-renderer-options';
import {ItemSorter} from './item-sorter';

type DataProvider<T> = Observable<T[]>;
type FiltererProvider<T> = Observable<ItemFilterer<T, any>>;
type GrouperProvider<T> = Observable<ItemGrouping<T>>;
type SortProvider<T> = Observable<ItemSorter<T>>;

export interface ItemsRendererResult<T> {
  groups: ItemGroup<T>[];
  count: number;
}

@Injectable()
export class ItemsRenderer<T> {
  /** Provider for the items to be filtered, grouped, and sorted. */
  get dataProvider() {
    return this._dataProvider.value;
  }
  set dataProvider(dataProvider: Observable<T[]>) {
    this._dataProvider.next(dataProvider);
  }
  private readonly _dataProvider = new BehaviorSubject<DataProvider<T>>(of([]));

  /** Provider for the filterer that will filter the items. */
  get filtererProvider() {
    return this._filtererProvider.value;
  }
  set filtererProvider(filtererProvider: FiltererProvider<T>) {
    this._filtererProvider.next(filtererProvider);
  }
  private readonly _filtererProvider =
      new BehaviorSubject<FiltererProvider<T>|null>(null).pipe(filter(v => !!v)) as
      BehaviorSubject<FiltererProvider<T>>;

  filteredData = new ReplaySubject<T[]>();

  /** Provider for the grouper which will group items together. */
  get grouperProvider() {
    return this._grouperProvider.value;
  }
  set grouperProvider(grouperProvider: GrouperProvider<T>) {
    this._grouperProvider.next(grouperProvider);
  }
  private readonly _grouperProvider = new BehaviorSubject<GrouperProvider<T>|null>(null).pipe(
                                          filter(v => !!v)) as BehaviorSubject<GrouperProvider<T>>;

  /** Provider for the sort which will sort items in each group. */
  get sorterProvider() {
    return this._sorterProvider.value;
  }
  set sorterProvider(sorterProvider: SortProvider<T>) {
    this._sorterProvider.next(sorterProvider);
  }
  private readonly _sorterProvider = new BehaviorSubject<SortProvider<T>|null>(null).pipe(
                                         filter(v => !!v)) as BehaviorSubject<SortProvider<T>>;

  options: ItemRendererOptions = new ItemRendererOptions();

  /** Stream emitting render data to the table (depends on ordered data changes). */
  private readonly _renderData = new ReplaySubject<ItemsRendererResult<T>>();

  /**
   * Subscription to the changes that should trigger an update to the table's rendered rows, such
   * as filtering, sorting, pagination, or base data changes.
   */
  _renderChangesSubscription: Subscription;

  constructor() {}

  ngOnDestroy() {
    if (this._renderChangesSubscription) {
      this._renderChangesSubscription.unsubscribe();
    }
  }

  connect(): Observable<ItemsRendererResult<T>> {
    if (!this._renderChangesSubscription) {
      this.initialize();
    }

    return this._renderData;
  }

  private initialize() {
    const filteredData =
        combineLatest(
            this._dataProvider, this._filtererProvider, this.options.state.pipe(startWith(null)))
            .pipe(
                mergeMap(results => {
                  const dataProvider = results[0];
                  const filtererProvider = results[1];

                  return combineLatest(dataProvider, filtererProvider);
                }),
                map(results => {
                  const data = results[0];
                  const filterer = results[1];

                  return filterer.filter(data, this.options.filters, this.options.search);
                }),
                tap(filteredData => {
                  this.filteredData.next(filteredData);
                }));

    // TODO: Options contains too much - group options should be separated
    const groupedData = this._grouperProvider.pipe(
        mergeMap(
            grouper =>
                combineLatest(filteredData, grouper, this.options.state.pipe(startWith(null)))),
        map(results => {
          const filteredData = results[0];
          const grouper = results[1];
          let itemGroups = grouper.getGroups(filteredData, this.options.grouping);

          return itemGroups.sort((a, b) => a.title < b.title ? -1 : 1);
        }));

    const sortedData = this._sorterProvider.pipe(
        mergeMap(
            sorter => combineLatest(groupedData, sorter, this.options.state.pipe(startWith(null)))),
        map(results => {
          const groupedData = results[0];
          const sorter = results[1];

          groupedData.forEach(group => {
            const sort = this.options.sorting;
            const sortFn = sorter.getSortFunction(sort);
            group.items = group.items.sort(sortFn);

            if (this.options.reverseSort) {
              group.items = group.items.reverse();
            }
          });

          return groupedData;
        }));


    this._renderChangesSubscription = combineLatest(filteredData, sortedData).subscribe(results => {
      const count = results[0].length;
      const groups = results[1];
      this._renderData.next({groups, count});
    });
  }
}
