import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, of, ReplaySubject, Subscription} from 'rxjs';
import {filter, map, mergeMap, startWith, tap} from 'rxjs/operators';
import {ItemFilterer} from './item-filterer';
import {GroupingMetadata, ItemGroup, ItemGrouper} from './item-grouping';
import {ItemRendererOptions} from './item-renderer-options';
import {ItemSorter} from './item-sorter';
import {IFilterMetadata} from './search-utility/filter';

type DataProvider<T> = Observable<T[]>;
type FiltererProvider<T> = Observable<ItemFilterer<T, any, any>>;
type SortProvider<T> = Observable<ItemSorter<T>>;

export interface ItemsRendererResult<T> {
  groups: ItemGroup<T>[];
  count: number;
}

const DefaultFilterMetadata = new Map<string, IFilterMetadata<null, null>>([]);

const DefaultGroupMetadata = new Map<'all', GroupingMetadata<any, 'all', null>>([
  [
    'all', {
      id: 'all',
      label: 'All',
      groupingFunction: (items: any[]) => [{id: 'all', title: 'All', items}]
    }
  ],
]);

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

  // TODO: Implement a reasonable default filterer, at least with basic search
  /** Provider for the grouper which will group items together. */
  filterer: ItemFilterer<T, any, any> =
      new ItemFilterer(of((_item: T) => null), (_item: T) => '', DefaultFilterMetadata);

  /** The grouper is responsible for grouping the filtered data into ItemGroups */
  grouper: ItemGrouper<T, any, any> = new ItemGrouper(of(null), DefaultGroupMetadata);

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
    const filteredData = this._dataProvider.pipe(
        mergeMap(dataProvider => dataProvider), mergeMap(data => this.filterer.filterItems(data)),
        tap(filteredData => {
          this.filteredData.next(filteredData);
        }));

    const groupedData = filteredData.pipe(mergeMap(items => this.grouper.groupItems(items)));

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
