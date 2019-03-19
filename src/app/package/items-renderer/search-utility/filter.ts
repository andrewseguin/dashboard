import {Observable} from 'rxjs';
import {Query} from './query';

export interface Filter {
  type: string;
  query?: Query;
  isImplicit?: boolean;
}

export interface IFilterMetadata<M, A> {
  label?: string;  // If present, will display as an option to the user
  queryType?: string;
  queryTypeData?: any;
  matcher?: (c: M, q: Query) => boolean;
  autocomplete?: (c: A) => Observable<string[]>;
}
