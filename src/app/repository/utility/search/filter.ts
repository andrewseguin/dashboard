import {Item, Label} from 'app/repository/services/dao';
import {Recommendation} from 'app/repository/services/dao/recommendations-dao';
import {RepoDao} from 'app/repository/services/dao/repo-dao';
import {Observable} from 'rxjs';
import {Query} from './query';


export interface MatcherContext {
  item: Item;
  labelsMap: Map<string, Label>;
  recommendations: Recommendation[];
}

export interface AutocompleteContext {
  repoDao?: RepoDao;
}

export interface Filter {
  type: string;
  query?: Query;
  isImplicit?: boolean;
}

export interface IFilterMetadata<M, A> {
  displayName?: string;  // If present, will display as an option to the user
  queryType?: string;
  queryTypeData?: any;
  matcher?: (c: M, q: Query) => boolean;
  autocomplete?: (c: A) => Observable<string[]>;
}
