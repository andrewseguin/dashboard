import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of, ReplaySubject, Subscription} from 'rxjs';
import {mergeMap, tap} from 'rxjs/operators';
import {ItemFilterer} from './item-filterer';
import {GroupingMetadata, ItemGroup, ItemGrouper} from './item-grouper';
import {ItemSorter} from './item-sorter';
import {ItemViewer} from './item-viewer';
import {IFilterMetadata} from './search-utility/filter';

type DataProvider<T> = Observable<T[]>;

export interface ItemGroupsResult<T> {
  groups: ItemGroup<T>[];
  count: number;
}

const DefaultFilterMetadata = new Map<string, IFilterMetadata<null, null>>([]);

const DefaultGroupMetadata = new Map<'all', GroupingMetadata<any, 'all', null>>([
  [
    'all', {
      id: 'all',
      label: 'All',
      groupingFunction: (items: any[]) => [{id: 'all', title: 'All', items}],
      titleTransform: () => '',
    }
  ],
]);

@Injectable()
export class ItemGroupsDataSource<T> {
  /** Provider for the items to be filtered, grouped, and sorted. */
  get dataProvider() {
    return this._dataProvider.value;
  }
  set dataProvider(dataProvider: Observable<T[]>) {
    this._dataProvider.next(dataProvider);
  }
  private readonly _dataProvider = new BehaviorSubject<DataProvider<T>>(of([]));

  // TODO: Implement a reasonable default filterer, at least with basic search
  /** Provider for the grouper which will group items together. */
  filterer: ItemFilterer<T, any, any> =
      new ItemFilterer(of((_item: T) => null), (_item: T) => '', DefaultFilterMetadata);

  /** The grouper is responsible for grouping the filtered data into ItemGroups */
  grouper: ItemGrouper<T, any, any> = new ItemGrouper(of(null), DefaultGroupMetadata);

  /** The sorter handles the sorting of items within each group. */
  sorter: ItemSorter<T, any, any> = new ItemSorter<T, '', null>(of(null), new Map());

  /** The viewer carries information to render the items to the view. */
  viewer: ItemViewer<T, any, any> = new ItemViewer<T, null, any>(new Map(), of(() => null));

  /** Stream emitting render data to the table (depends on ordered data changes). */
  private readonly _renderData = new ReplaySubject<ItemGroupsResult<T>>();

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

  connect(): Observable<ItemGroupsResult<T>> {
    if (!this._renderChangesSubscription) {
      this.initialize();
    }

    return this._renderData;
  }

  private initialize() {
    let filteredDataCount: number;
    this._renderChangesSubscription =
        this._dataProvider
            .pipe(
                mergeMap(dataProvider => dataProvider),
                mergeMap(data => this.filterer.filterItems(data)),
                tap(filteredData => filteredDataCount = filteredData.length),
                mergeMap(filteredItems => this.grouper.groupItems(filteredItems)),
                mergeMap(groupedItems => this.sorter.performSort(groupedItems)))
            .subscribe(sortedItems => {
              const count = filteredDataCount;
              const groups = sortedItems;
              this._renderData.next({groups, count});
            });
  }
}
