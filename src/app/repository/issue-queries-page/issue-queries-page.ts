import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Router} from '@angular/router';
import {Repo, RepoDao} from 'app/service/repo-dao';
import {combineLatest} from 'rxjs';
import {delay, filter, map} from 'rxjs/operators';

import {ActivatedRepository} from '../services/activated-repository';
import {IssueQueriesDao, IssueQuery} from '../services/dao/issue-queries-dao';
import {Recommendation, RecommendationsDao} from '../services/dao/recommendations-dao';
import {IssueFilterer} from '../services/issues-renderer/issue-filterer';
import {getIssuesMatchingFilterAndSearch} from '../utility/get-issues-matching-filter-and-search';


interface IssueQueryGroup {
  issueQueries: IssueQuery[];
  name: string;
}

@Component({
  styleUrls: ['issue-queries-page.scss'],
  templateUrl: 'issue-queries-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueQueriesPage {
  issueQueryGroups = this.issueQueriesDao.list.pipe(map(getSortedGroups));

  issueQueryResultsCount =
      combineLatest(this.repoDao.repo, this.issueQueryGroups)
          .pipe(
              filter(result => !!result[0] && !!result[1]), delay(200),
              map(result => {
                const repo = result[0] as Repo;
                const groups = result[1] as IssueQueryGroup[];

                const map = new Map<string, number>();
                groups.forEach(group => group.issueQueries.forEach(query => {
                  const filterer =
                      new IssueFilterer(query.options.filters, repo);
                  const count = getIssuesMatchingFilterAndSearch(
                                    repo.issues, filterer, query.options.search)
                                    .length;
                  map.set(query.id, count);
                }));

                return map;
              }));

  issueQueryKeyTrackBy = (_i, issueQuery: IssueQuery) => issueQuery.id;

  constructor(
      public issueQueriesDao: IssueQueriesDao, public repoDao: RepoDao,
      private router: Router, private recommendationsDao: RecommendationsDao,
      private activatedRepository: ActivatedRepository) {}

  createIssueQuery() {
    this.router.navigate(
        [`${this.activatedRepository.repository.value}/issue-query/new`]);
  }

  createIssueQueryFromRecommendation(recommendation: Recommendation) {
    this.router.navigate(
        [`${this.activatedRepository.repository.value}/issue-query/new`],
        {queryParams: {'recommendationId': recommendation.id}});
  }

  navigateToIssueQuery(id: string) {
    this.router.navigate(
        [`${this.activatedRepository.repository.value}/issue-query/${id}`]);
  }
}


function getSortedGroups(issueQueries: IssueQuery[]) {
  if (!issueQueries) {
    return;
  }

  const groups = new Map<string, IssueQuery[]>();
  issueQueries.forEach(issueQuery => {
    const group = issueQuery.group || 'Other';
    if (!groups.has(group)) {
      groups.set(group, []);
    }

    groups.get(group).push(issueQuery);
  });

  const sortedGroups: IssueQueryGroup[] = [];
  Array.from(groups.keys()).sort().forEach(group => {
    const issueQueries = groups.get(group);
    issueQueries.sort((a, b) => a.name < b.name ? -1 : 1);
    sortedGroups.push({name: group, issueQueries});
  });

  return sortedGroups;
}
