import {Contributor, Issue, Label} from 'app/service/github';
import {RepoDao} from 'app/service/repo-dao';
import {Observable} from 'rxjs';

import {Query} from './query';

export interface MatcherContext {
  issue?: Issue;
  labels?: Label[];
  contributors?: Contributor[];
}

export interface AutocompleteContext {
  repoDao?: RepoDao;
}

export interface Filter {
  type: string;
  query?: Query;
  isImplicit?: boolean;
}

export interface IFilterMetadata {
  displayName?: string;  // If present, will display as an option to the user
  queryType?: string;
  queryTypeData?: any;
  matcher?: (c: MatcherContext, q: Query) => boolean;
  autocomplete?: (c: AutocompleteContext) => Observable<string[]>;
}
