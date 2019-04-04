import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {shareReplay} from 'rxjs/operators';
import {Filterer} from './filterer';
import {Group, Grouper} from './grouper';
import {Provider} from './provider';
import {Sorter} from './sorter';

@Injectable()
export class DataSource<T> {
  /** Provider for the items to be filtered, grouped, and sorted. */
  provider = new Provider<T>(new Map(), of([]));

  /** The sorter handles the sorting of items within each group. */
  sorter: Sorter<T, any, any> = new Sorter<T, '', null>(new Map(), of(null));

  connect(filterer: Filterer<T>, grouper: Grouper<T>): Observable<Group<T>[]> {
    return this.provider.getData().pipe(
        filterer.filter(), grouper.group(), this.sorter.sort(), shareReplay());
  }
}
