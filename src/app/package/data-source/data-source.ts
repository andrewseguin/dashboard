import {Injectable} from '@angular/core';
import {Observable, of, ReplaySubject, Subscription} from 'rxjs';
import {mergeMap, tap} from 'rxjs/operators';
import {Filterer, FiltererMetadata} from './filterer';
import {Group, Grouper, GrouperMetadata} from './grouper';
import {Provider} from './provider';
import {Sorter} from './sorter';
import {Viewer} from './viewer';

export interface GroupedResults<T> {
  groups: Group<T>[];
  count: number;
}

const DefaultFiltererMetadata = new Map<string, FiltererMetadata<null, null>>([]);

const DefaultGrouperMetadata = new Map<'all', GrouperMetadata<any, 'all', null>>([
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
  provider = new Provider<T>(new Map(), of([]));

  // TODO: Implement a reasonable default filterer, at least with basic search
  /** Provider for the grouper which will group items together. */
  filterer: Filterer<T, any, any> =
      new Filterer(DefaultFiltererMetadata, of((_item: T) => null), (_item: T) => '');

  /** The grouper is responsible for grouping the filtered data into ItemGroups */
  grouper: Grouper<T, any, any> = new Grouper(DefaultGrouperMetadata, of(null));

  /** The sorter handles the sorting of items within each group. */
  sorter: Sorter<T, any, any> = new Sorter<T, '', null>(new Map(), of(null));

  /** The viewer carries information to render the items to the view. */
  viewer: Viewer<T, any, any> = new Viewer<T, null, any>(new Map(), of(() => null));

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
