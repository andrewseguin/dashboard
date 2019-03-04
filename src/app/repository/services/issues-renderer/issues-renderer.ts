import {Injectable} from '@angular/core';
import {tokenizeIssue} from 'app/repository/utility/tokenize-issue';
import {Issue} from 'app/service/github';
import {Repo, RepoDao} from 'app/service/repo-dao';
import {BehaviorSubject, combineLatest, Subscription} from 'rxjs';
import {startWith} from 'rxjs/operators';

import {IssueFilterer} from './issue-filterer';
import {IssueGroup, IssueGrouping} from './issue-grouping';
import {IssueRendererOptions} from './issue-renderer-options';
import {IssueSorter} from './issue-sorter';

@Injectable()
export class IssuesRenderer {
  options: IssueRendererOptions = new IssueRendererOptions();

  // Starts as null as a signal that no issues have been processed.
  issueGroups = new BehaviorSubject<IssueGroup[] | null>(null);

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

    this.initSubscription = combineLatest(data).subscribe(result => {
      const repo = result[0] as Repo;

      if (!repo) {
        return [];
      }

      const issues = repo.issues;

      // Filter
      const issueFilterer = new IssueFilterer(this.options);
      let filteredIssues = issueFilterer.filter(repo);

      // Search
      const search = this.options.search;
      const searchedIssues =
        !search ? filteredIssues : filteredIssues.filter(issue => {
          return this.issueMatchesSearch(search, issue);
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

  issueMatchesSearch(token: string, issue: Issue) {
    const issueStr = tokenizeIssue(issue);
    return issueStr.indexOf(token.toLowerCase()) != -1;
  }
}
