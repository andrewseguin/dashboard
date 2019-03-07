import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Repo, RepoDao} from 'app/service/repo-dao';
import {combineLatest, Observable} from 'rxjs';
import {delay, filter, map} from 'rxjs/operators';

import {ActivatedRepository} from '../services/activated-repository';
import {IssueQueriesDao, IssueQuery} from '../services/dao/issue-queries-dao';
import {Recommendation, RecommendationsDao} from '../services/dao/recommendations-dao';
import {IssueRecommendations} from '../services/issue-recommendations';
import {IssueFilterer} from '../services/issues-renderer/issue-filterer';
import {getIssuesMatchingFilterAndSearch} from '../utility/get-issues-matching-filter-and-search';
import { IssueType } from 'app/service/github';


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
  type: Observable<IssueType> = this.activatedRoute.params.pipe(map(params => params.type));

  issueQueryGroups = combineLatest(this.issueQueriesDao.list, this.type)
                         .pipe(
                             filter(result => !!result[0]),
                             map(result => result[0].filter(item => item.type === result[1])),
                             map(getSortedGroups));

  issueQueryResultsCount =
      combineLatest(
          this.repoDao.repo, this.issueQueryGroups, this.issueRecommendations.recommendations,
          this.type)
          .pipe(
              filter(result => !!result[0] && !!result[1] && !!result[2]), delay(1000),
              map(result => {
                const repo = result[0] as Repo;
                const groups = result[1] as IssueQueryGroup[];
                const recommendations = result[2] as Map<number, Recommendation[]>;
                const type = result[3] as IssueType;
                const items =
                    type === 'issue' ? repo.issues : type === 'pr' ? repo.pullRequests : [];

                const map = new Map<string, number>();
                groups.forEach(group => group.issueQueries.forEach(query => {
                  const filterer = new IssueFilterer(query.options.filters, repo, recommendations);
                  const count =
                      getIssuesMatchingFilterAndSearch(items, filterer, query.options.search)
                          .length;
                  map.set(query.id, count);
                }));

                return map;
              }));

  issueQueryKeyTrackBy = (_i, issueQuery: IssueQuery) => issueQuery.id;

  constructor(
      public issueQueriesDao: IssueQueriesDao, public repoDao: RepoDao, private router: Router,
      private activatedRoute: ActivatedRoute, private issueRecommendations: IssueRecommendations,
      public recommendationsDao: RecommendationsDao,
      private activatedRepository: ActivatedRepository) {}

  createIssueQuery(type: IssueType) {
    this.router.navigate(
        [`${this.activatedRepository.repository.value}/issue-query/new`],
        {queryParams: {type}});
  }

  createIssueQueryFromRecommendation(recommendation: Recommendation) {
    this.router.navigate(
        [`${this.activatedRepository.repository.value}/issue-query/new`],
        {queryParams: {'recommendationId': recommendation.id}});
  }

  navigateToIssueQuery(id: string) {
    this.router.navigate([`${this.activatedRepository.repository.value}/issue-query/${id}`]);
  }
}


function getSortedGroups(issueQueries: IssueQuery[]) {
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
