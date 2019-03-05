import {Injectable} from '@angular/core';
import {getIssuesMatchingFilterAndSearch} from 'app/repository/utility/get-issues-matching-filter-and-search';
import {Repo, RepoDao} from 'app/service/repo-dao';
import {BehaviorSubject, combineLatest, Subscription} from 'rxjs';
import {debounceTime, delay, startWith} from 'rxjs/operators';

import {RecommendationsDao} from '../dao/recommendations-dao';

import {IssueFilterer} from './issue-filterer';
import {IssueGroup, IssueGrouping} from './issue-grouping';
import {IssueRendererOptions} from './issue-renderer-options';
import {IssueSorter} from './issue-sorter';



@Injectable()
export class IssuesRenderer {
  options: IssueRendererOptions = new IssueRendererOptions();

  // Starts as null as a signal that no issues have been processed.
  issueGroups = new BehaviorSubject<IssueGroup[]|null>(null);

  private initSubscription: Subscription;

  constructor(private repoDao: RepoDao) {}

  ngOnDestroy() {
    this.initSubscription.unsubscribe();
  }

  initialize() {
    if (this.initSubscription) {
      throw new Error('Already been initialized');
    }

    const data: any[] = [
      this.repoDao.repo,
      this.options.changed.pipe(startWith(null)),
    ];

    this.initSubscription =
        combineLatest(data).pipe(debounceTime(250)).subscribe(result => {
          const repo = result[0] as Repo;

          if (!repo) {
            return [];
          }

          // Filter and search
          const filterer = new IssueFilterer(this.options.filters, repo);
          const filteredAndSearchedIssues = getIssuesMatchingFilterAndSearch(
              repo.issues, filterer, this.options.search);

          // Group
          const grouper = new IssueGrouping(filteredAndSearchedIssues, repo);
          let issueGroups = grouper.getGroup(this.options.grouping);
          issueGroups = issueGroups.sort((a, b) => a.title < b.title ? -1 : 1);

          // Sort
          const issueSorter = new IssueSorter();
          issueGroups.forEach(group => {
            const sort = this.options.sorting;
            const sortFn = issueSorter.getSortFunction(sort);
            group.issues = group.issues.sort(sortFn);

            if (this.options.reverseSort) {
              group.issues = group.issues.reverse();
            }
          });

          this.issueGroups.next(issueGroups);
        });
  }
}
