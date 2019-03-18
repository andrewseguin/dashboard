import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, of, Subscription} from 'rxjs';
import {filter, map, mergeMap, startWith, tap} from 'rxjs/operators';
import {ItemFilterer} from './item-filterer';
import {ItemGroup, ItemGrouping} from './item-grouping';
import {ItemRendererOptions} from './item-renderer-options';
import {ItemSorter} from './item-sorter';

type DataProvider<T> = Observable<T[]>;
type FiltererProvider<T> = Observable<ItemFilterer<T, any>>;
type GrouperProvider<T> = Observable<ItemGrouping<T>>;

@Injectable()
export class ItemsRenderer<T> {
  /** Observable that provides the items to be filtered. */
  get data() {
    return this._data.value;
  }
  set data(data: Observable<T[]>) {
    this._data.next(data);
  }
  private readonly _data = new BehaviorSubject<DataProvider<T>>(of([]));

  /** Provider for the filterer used to filter items. */
  get filterer() {
    return this._filterer.value;
  }
  set filterer(filterer: FiltererProvider<T>) {
    this._filterer.next(filterer);
  }
  private readonly _filterer = new BehaviorSubject<FiltererProvider<T>|null>(null).pipe(
                                   filter(v => !!v)) as BehaviorSubject<FiltererProvider<T>>;

  /** Provider for the grouper which will group items together. */
  get grouper() {
    return this._grouper.value;
  }
  set grouper(grouper: GrouperProvider<T>) {
    this._grouper.next(grouper);
  }
  private readonly _grouper = new BehaviorSubject<GrouperProvider<T>|null>(null).pipe(
                                  filter(v => !!v)) as BehaviorSubject<GrouperProvider<T>>;

  options: ItemRendererOptions = new ItemRendererOptions();

  _itemGroups = new BehaviorSubject<ItemGroup<T>[]|null>(null);
  itemGroups = this._itemGroups.pipe(filter(v => !!v)) as Observable<ItemGroup<T>[]>;

  // Number of items in the item groups.
  itemCount = new BehaviorSubject<number|null>(null);

  private initSubscription: Subscription;

  constructor() {}

  ngOnDestroy() {
    if (this.initSubscription) {
      this.initSubscription.unsubscribe();
    }
  }

  initialize(sorter: ItemSorter<T>) {
    if (this.initSubscription) {
      this.initSubscription.unsubscribe();
    }

    const filteredData =
        combineLatest(this._data, this._filterer, this.options.state.pipe(startWith(null)))
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
                  // TODO: Item count should just watch filtered data
                  return this.itemCount.next(filteredData.length);
                }));

    // TODO: Options contains too much - group options should be separated
    const groupedData = this._grouper.pipe(
        mergeMap(
            grouper =>
                combineLatest(filteredData, grouper, this.options.state.pipe(startWith(null)))),
        map(results => {
          const filteredData = results[0];
          const grouper = results[1];
          let itemGroups = grouper.getGroups(filteredData, this.options.grouping);

          return itemGroups.sort((a, b) => a.title < b.title ? -1 : 1);
        }));

    const sortedData =
        combineLatest(groupedData, this.options.state.pipe(startWith(null))).pipe(map(results => {
          const groupedData = results[0];

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

    this.initSubscription = sortedData.subscribe(sortedData => {
      this._itemGroups.next(sortedData);
    });
  }
}
