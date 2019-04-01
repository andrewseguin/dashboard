import {Injectable} from '@angular/core';
import {Observable, of, ReplaySubject, Subscription} from 'rxjs';
import {mergeMap, tap} from 'rxjs/operators';
import {ItemFilterer} from './item-filterer';
import {GroupingMetadata, ItemGroup, ItemGrouper} from './item-grouper';
import {ItemProvider} from './item-provider';
import {ItemSorter} from './item-sorter';
import {ItemViewer} from './item-viewer';
import {IFilterMetadata} from './search-utility/filter';

export interface GroupedResults<T> {
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
  provider = new ItemProvider<T>(new Map(), of([]));

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

  /** Stream emitting the  data to the table (depends on ordered data changes). */
  private readonly groupedResults = new ReplaySubject<GroupedResults<T>>(1);

  /**
   * Subscription to the changes that should trigger an update to the table's rendered rows, such
   * as filtering, sorting, pagination, or base data changes.
   */
  private subscription: Subscription;

  constructor() {}

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  connect(): Observable<GroupedResults<T>> {
    if (!this.subscription) {
      this.initialize();
    }

    return this.groupedResults;
  }

  private initialize() {
    let filteredDataCount: number;
    this.subscription = this.provider.getData()
                            .pipe(
                                mergeMap(data => this.filterer.filter(data)),
                                tap(data => filteredDataCount = data.length),
                                mergeMap(data => this.grouper.group(data)),
                                mergeMap(data => this.sorter.sort(data)))
                            .subscribe(sortedItems => {
                              const count = filteredDataCount;
                              const groups = sortedItems;
                              this.groupedResults.next({groups, count});
                            });
  }
}
