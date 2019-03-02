import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {MatSortBase} from '@angular/material';
import {Issue} from 'app/service/github';
import {Repo, RepoDao} from 'app/service/repo-dao';
import {BehaviorSubject, combineLatest, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {IssueRecommendations} from '../services/issue-recommendations';
import {getIssuesMatchingSearch} from '../utility/get-issues-matching-search';
import {Filter, MatcherContext} from '../utility/search/filter';

import {getSortFunction} from './issue-sorter';
import {IssuesFilterMetadata} from './issues-filter-metadata';

export type SortId = 'created';

export interface Sort {
  id: SortId;
  reverse: boolean;
}

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

  set sort(v: Sort) {
    this._sort.next(v);
  }
  get sort(): Sort {
    return this._sort.value;
  }
  _sort = new BehaviorSubject<Sort>({id: 'created', reverse: false});

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
      this._sort,
    ];
    combineLatest(changes)
        .pipe(takeUntil(this._destroyed))
        .subscribe(result => {
          const repo = result[0] as Repo;
          const search = result[1] as string;
          const filters = result[2] as Filter[];
          const sort = result[3] as Sort;

          if (repo) {
            const filteredIssues = this.filter(repo, filters);
            const searchIssues =
                getIssuesMatchingSearch(filteredIssues, repo, search);
            this.issues = searchIssues.sort(getSortFunction(sort.id, repo));

            if (sort.reverse) {
              this.issues = this.issues.reverse();
            }

            this.cd.markForCheck();
          }
        });
  }

  /**
   * Returns the list of issues that match the provided filters.
   */
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

function sortIssues(issues: Issue[], sort: Sort): Issue[] {
  return issues;
}
