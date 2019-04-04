import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {shareReplay} from 'rxjs/operators';
import {Filterer} from './filterer';
import {Group, Grouper} from './grouper';
import {Provider} from './provider';
import {Sorter} from './sorter';

@Injectable()
export class DataSource<T> {
  connect(provider: Provider, filterer: Filterer<T>, grouper: Grouper<T>, sorter: Sorter<any>):
      Observable<Group<T>[]> {
    return provider.getData().pipe(
        filterer.filter(), grouper.group(), sorter.sortGroups(), shareReplay());
  }
}
