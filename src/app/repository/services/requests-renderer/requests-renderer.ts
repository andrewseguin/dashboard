import {Injectable} from '@angular/core';
import {tokenizeIssue} from 'app/repository/utility/tokenize-issue';
import {Issue} from 'app/service/github';
import {Repo, RepoDao} from 'app/service/repo-dao';
import {BehaviorSubject, combineLatest, Subscription} from 'rxjs';
import {startWith} from 'rxjs/operators';

import {RequestFilterer} from './request-filterer';
import {RequestGroup, RequestGrouping} from './request-grouping';
import {RequestRendererOptions} from './request-renderer-options';
import {RequestSorter} from './request-sorter';

@Injectable()
export class RequestsRenderer {
  options: RequestRendererOptions = new RequestRendererOptions();

  // Starts as null as a signal that no requests have been processed.
  requestGroups = new BehaviorSubject<RequestGroup[]|null>(null);

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
      const requestFilterer = new RequestFilterer(this.options);
      let filteredRequests = requestFilterer.filter(repo);

      // Search
      const search = this.options.search;
      const searchedIssues =
          !search ? filteredRequests : filteredRequests.filter(issue => {
            return this.requestMatchesSearch(search, issue);
          });

      // Group
      const grouper = new RequestGrouping(searchedIssues, repo);
      let requestGroups = grouper.getGroup(this.options.grouping);
      requestGroups = requestGroups.sort((a, b) => a.title < b.title ? -1 : 1);

      // Sort
      const requestSortPipe = new RequestSorter();
      requestGroups.forEach(group => {
        const sort = this.options.sorting;
        const sortFn = requestSortPipe.getSortFunction(sort);
        group.issues = group.issues.sort(sortFn);

        if (this.options.reverseSort) {
          group.issues = group.issues.reverse();
        }
      });

      this.requestGroups.next(requestGroups);
    });
  }

  requestMatchesSearch(token: string, issue: Issue) {
    const requestStr = tokenizeIssue(issue);
    return requestStr.indexOf(token.toLowerCase()) != -1;
  }
}
