import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {shareReplay} from 'rxjs/operators';
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
  private results: Observable<Group<T>[]>;

  connect(): Observable<Group<T>[]> {
    if (!this.results) {
      this.results = this.provider.getData().pipe(
          this.filterer.filter(), this.grouper.group(), this.sorter.sort(), shareReplay());
    }

    return this.results;
  }
}
