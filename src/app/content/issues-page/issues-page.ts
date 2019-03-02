import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {Issue} from 'app/service/github';
import {Repo, RepoDao} from 'app/service/repo-dao';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';

import {IssueRecommendations} from '../services/issue-recommendations';
import {AutocompleteContext, Filter, IFilterMetadata, MatcherContext} from '../utility/search/filter';
import {DateQuery, InputQuery, NumberQuery, StateQuery} from '../utility/search/query';
import {dateMatchesEquality, numberMatchesEquality, stateMatchesEquality, stringContainsQuery} from '../utility/search/query-matcher';


@Component({
  styleUrls: ['issues-page.scss'],
  templateUrl: 'issues-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssuesPage {
  issues: Issue[] = [];

  set search(v: string) {
    this._search.next(v);
  }
  get search(): string {
    return this._search.value;
  }
  _search = new BehaviorSubject<string>('');

  set filters(v: Filter[]) {
    this._filters.next(v);
  }
  get filters(): Filter[] {
    return this._filters.value;
  }
  _filters = new BehaviorSubject<Filter[]>([]);

  issueFilterMetadata = IssuesFilterMetadata;

  selectedIssue: number;

  private _destroyed = new Subject();

  trackByNumber = (_i, issue: Issue) => issue.number;

  constructor(
      private repoDao: RepoDao, private cd: ChangeDetectorRef,
      public issueRecommendations: IssueRecommendations) {
    const changes = [
      this.repoDao.repo,
      this._search,
      this._filters,
    ];
    combineLatest(changes)
        .pipe(takeUntil(this._destroyed))
        .subscribe(result => {
          const repo = result[0] as Repo;
          const search = result[1] as string;
          const filters = result[2] as Filter[];

          if (repo) {
            const filteredIssues = this.filter(repo, filters);
            this.issues = getIssuesMatchingSearch(filteredIssues, repo, search);
            this.cd.markForCheck();
          }
        });
  }

  filter(repo: Repo, filters: Filter[]) {
    return repo.issues.filter(issue => {
      return filters.every(filter => {
        if (!filter.query) {
          return true;
        }

        const context: MatcherContext = {
          issue: issue,
          labels: repo.labels,
          contributors: repo.contributors
        };
        return this.issueFilterMetadata.get(filter.type)
            .matcher(context, filter.query);
      });
    });
  }
}


export function getIssuesMatchingSearch(
    items: Issue[], repo: Repo, query: string): Issue[] {
  const tokens = query.split(' ');
  return items.filter(item => {
    return tokens.every(token => {
      return tokenizeIssue(item).indexOf(token.toLowerCase()) != -1;
    });
  });
}

/**
 * Returns a lower-cased string that contains the searchable tokens of Issue.
 */
export function tokenizeIssue(issue: Issue) {
  const issueStr =
      (issue.title || '') + (issue.body || '') + (issue.reporter || '');
  return issueStr.toLowerCase();
}

export const IssuesFilterMetadata = new Map<string, IFilterMetadata>([

  /** InputQuery Filters */

  [
    'title', {
      displayName: 'Title',
      queryType: 'input',
      matcher: (c: MatcherContext, q: InputQuery) => {
        return stringContainsQuery(c.issue.title, q);
      },
      autocomplete: (c: AutocompleteContext) => {
        return c.repoDao.repo.pipe(map(repo => {
          return repo.issues.map(issue => issue.title);
        }));
      }
    }
  ],

  /** NumberQuery Filters */

  [
    'commentCount', {
      displayName: 'Comment Count',
      queryType: 'number',
      matcher: (c: MatcherContext, q: NumberQuery) => {
        return numberMatchesEquality(c.issue.comments, q);
      }
    }
  ],

  /** DateQuery Filters */

  [
    'created', {
      displayName: 'Date Created',
      queryType: 'date',
      matcher: (c: MatcherContext, q: DateQuery) => {
        return dateMatchesEquality(c.issue.created, q);
      }
    }
  ],

  /** StateQuery */

  [
    'state', {
      displayName: 'State',
      queryType: 'state',
      queryTypeData: {states: ['open', 'closed']},
      matcher: (c: MatcherContext, q: StateQuery) => {
        const values = new Map<string, boolean>([
          ['open', c.issue.state === 'open'],
          ['closed', c.issue.state === 'closed'],
        ]);
        return stateMatchesEquality(values.get(q.state), q);
      },
    }
  ],
]);
