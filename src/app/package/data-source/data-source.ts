import {Injectable} from '@angular/core';
import {Observable, of, ReplaySubject, Subscription} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {Filterer} from './filterer';
import {Group, Grouper, GrouperMetadata} from './grouper';
import {Provider} from './provider';
import {Sorter} from './sorter';
import {Viewer} from './viewer';

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
export class DataSource<T> {
  /** Provider for the items to be filtered, grouped, and sorted. */
  provider = new Provider<T>(new Map(), of([]));

  /** The filterer takes filter and search query information to filter items. */
  filterer: Filterer<T> = new Filterer(new Map(), of((_item: T) => null));

  /** The grouper is responsible for grouping the filtered data into ItemGroups */
  grouper: Grouper<T, any, any> = new Grouper(DefaultGrouperMetadata, of(null));

  /** The sorter handles the sorting of items within each group. */
  sorter: Sorter<T, any, any> = new Sorter<T, '', null>(new Map(), of(null));

  /** The viewer carries information to render the items to the view. */
  viewer: Viewer<T, any, any> = new Viewer<T, null, any>(new Map(), of(() => null));

  /** Stream emitting the grouped data. */
  private readonly results = new ReplaySubject<Group<T>[]>(1);

  /**
   * Subscription to the changes that should trigger an update to the table's rendered rows, such
   * as filtering, sorting, pagination, or base data changes.
   */
  private subscription: Subscription;

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  connect(): Observable<Group<T>[]> {
    if (!this.subscription) {
      this.initialize();
    }

    return this.results;
  }

  private initialize() {
    this.subscription = this.provider.getData()
                            .pipe(
                                mergeMap(data => this.filterer.filter(data)),
                                mergeMap(data => this.grouper.group(data)),
                                mergeMap(data => this.sorter.sort(data)))
                            .subscribe(data => this.results.next(data));
  }
}
