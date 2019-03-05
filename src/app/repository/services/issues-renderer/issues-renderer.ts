import {Injectable} from '@angular/core';
import {issueMatchesSearch} from 'app/repository/utility/issue-matches-search';
import {Repo, RepoDao} from 'app/service/repo-dao';
import {BehaviorSubject, combineLatest, Subscription} from 'rxjs';
import {startWith} from 'rxjs/operators';
import {Recommendation, RecommendationsDao} from '../dao/recommendations-dao';
import {IssueFilterer} from './issue-filterer';
import {IssueGroup, IssueGrouping} from './issue-grouping';
import {IssueRendererOptions} from './issue-renderer-options';
import {IssueSorter} from './issue-sorter';
import {IssuesFilterMetadata} from './issues-filter-metadata';



@Injectable()
export class IssuesRenderer {
  options: IssueRendererOptions = new IssueRendererOptions();

  // Starts as null as a signal that no issues have been processed.
  issueGroups = new BehaviorSubject<IssueGroup[]|null>(null);

  private initSubscription: Subscription;

  constructor(
      private repoDao: RepoDao,
      private recommendationsDao: RecommendationsDao) {}

  ngOnDestroy() {
    this.initSubscription.unsubscribe();
  }

  initialize() {
    if (this.initSubscription) {
      throw new Error('Already been initialized');
    }

    const data: any[] = [
      this.repoDao.repo,
      this.recommendationsDao.list,
      this.options.changed.pipe(startWith(null)),
    ];

    this.initSubscription = combineLatest(data).subscribe(result => {
      const repo = result[0] as Repo;
      const recommendations = result[1] as Recommendation[];

      if (!repo) {
        return [];
      }

      // Filter
      const issueFilterer = new IssueFilterer(this.options.filters, repo);
      let filteredIssues = issueFilterer.filter(repo.issues);

      // Search
      const search = this.options.search;
      const searchedIssues =
          !search ? filteredIssues : filteredIssues.filter(issue => {
            return issueMatchesSearch(search, issue);
          });

      // Group
      const grouper = new IssueGrouping(searchedIssues, repo);
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
