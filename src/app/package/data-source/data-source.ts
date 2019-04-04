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

  connect(filterer: Filterer<T>, grouper: Grouper<T>, sorter: Sorter<any>): Observable<Group<T>[]> {
    return this.provider.getData().pipe(
        filterer.filter(), grouper.group(), sorter.sort(), shareReplay());
  }
}
