import {Injectable} from '@angular/core';
import {
  getIssuesMatchingFilterAndSearch
} from 'app/repository/utility/get-issues-matching-filter-and-search';
import {Repo, RepoDao} from 'app/service/repo-dao';
import {BehaviorSubject, combineLatest, Subscription} from 'rxjs';
import {debounceTime, filter, startWith} from 'rxjs/operators';

import {Recommendation} from '../dao/recommendations-dao';
import {IssueRecommendations} from '../issue-recommendations';

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

  constructor(private repoDao: RepoDao, private issuesRecommendations: IssueRecommendations) {}

  ngOnDestroy() {
    if (this.initSubscription) {
      this.initSubscription.unsubscribe();
    }
  }

  initialize() {
    if (this.initSubscription) {
      throw new Error('Already been initialized');
    }

    const data: any[] = [
      this.repoDao.repo,
      this.issuesRecommendations.recommendations,
      this.options.changed.pipe(startWith(null)),
    ];

    this.initSubscription =
        combineLatest(data)
            .pipe(filter(result => !!result[0] && !!result[1]), debounceTime(50))
            .subscribe(result => {
              const repo = result[0] as Repo;
              const recommendations = result[1] as Map<number, Recommendation[]>;

              // Filter and search
              const filterer = new IssueFilterer(this.options.filters, repo, recommendations);
              const filteredAndSearchedIssues =
                  getIssuesMatchingFilterAndSearch(repo.issues, filterer, this.options.search);

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
