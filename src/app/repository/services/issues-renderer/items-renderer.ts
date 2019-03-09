import {Injectable} from '@angular/core';
import {
  getItemsMatchingFilterAndSearch
} from 'app/repository/utility/get-items-matching-filter-and-search';
import {ItemType} from 'app/service/github';
import {Repo, RepoDao} from 'app/service/repo-dao';
import {BehaviorSubject, combineLatest, Subscription} from 'rxjs';
import {debounceTime, filter, startWith} from 'rxjs/operators';

import {Recommendation} from '../dao/recommendations-dao';
import {IssueRecommendations} from '../issue-recommendations';

import {IssueFilterer} from './issue-filterer';
import {ItemGroup, ItemGrouping} from './issue-grouping';
import {IssueRendererOptions} from './issue-renderer-options';
import {IssueSorter} from './issue-sorter';


@Injectable()
export class ItemsRenderer {
  options: IssueRendererOptions = new IssueRendererOptions();

  // Starts as null as a signal that no items have been processed.
  itemGroups = new BehaviorSubject<ItemGroup[]|null>(null);

  // Number of issues in the issue groups.
  issueCount = new BehaviorSubject<number|null>(null);

  private initSubscription: Subscription;

  constructor(private repoDao: RepoDao, private issuesRecommendations: IssueRecommendations) {}

  ngOnDestroy() {
    if (this.initSubscription) {
      this.initSubscription.unsubscribe();
    }
  }

  initialize(type: ItemType) {
    if (this.initSubscription) {
      this.initSubscription.unsubscribe();
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
              const items = type === 'issue' ? repo.issues : repo.pullRequests;
              const recommendations = result[1] as Map<number, Recommendation[]>;

              // Filter and search
              const filterer = new IssueFilterer(this.options.filters, repo, recommendations);
              const filteredAndSearchedIssues =
                  getItemsMatchingFilterAndSearch(items, filterer, this.options.search);

              // Group
              const grouper = new ItemGrouping(filteredAndSearchedIssues, repo);
              let itemGroups = grouper.getGroup(this.options.grouping);
              itemGroups = itemGroups.sort((a, b) => a.title < b.title ? -1 : 1);

              // Sort
              const issueSorter = new IssueSorter();
              itemGroups.forEach(group => {
                const sort = this.options.sorting;
                const sortFn = issueSorter.getSortFunction(sort);
                group.issues = group.issues.sort(sortFn);

                if (this.options.reverseSort) {
                  group.issues = group.issues.reverse();
                }
              });

              this.itemGroups.next(itemGroups);
              this.issueCount.next(filteredAndSearchedIssues.length);
            });
  }
}
