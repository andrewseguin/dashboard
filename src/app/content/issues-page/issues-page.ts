import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {Issue} from 'app/service/github';
import {Repo, RepoDao} from 'app/service/repo-dao';
import {BehaviorSubject, combineLatest, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {IssueRecommendations} from '../services/issue-recommendations';
import {getIssuesMatchingSearch} from '../utility/get-issues-matching-search';
import {Filter, MatcherContext} from '../utility/search/filter';
import {IssuesFilterMetadata} from './issues-filter-metadata';

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
