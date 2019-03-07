import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ItemType} from 'app/service/github';
import {Repo, RepoDao} from 'app/service/repo-dao';
import {combineLatest, Observable} from 'rxjs';
import {delay, filter, map} from 'rxjs/operators';

import {ActivatedRepository} from '../services/activated-repository';
import {IssueQueriesDao, IssueQuery as ItemQuery} from '../services/dao/issue-queries-dao';
import {Recommendation, RecommendationsDao} from '../services/dao/recommendations-dao';
import {IssueRecommendations} from '../services/issue-recommendations';
import {IssueFilterer} from '../services/issues-renderer/issue-filterer';
import {getIssuesMatchingFilterAndSearch} from '../utility/get-issues-matching-filter-and-search';


interface QueryGroup {
  queries: ItemQuery[];
  name: string;
}

@Component({
  styleUrls: ['queries-page.scss'],
  templateUrl: 'queries-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueriesPage {
  type: Observable<ItemType> = this.activatedRoute.params.pipe(map(params => params.type));

  queryGroups = combineLatest(this.issueQueriesDao.list, this.type)
                    .pipe(
                        filter(result => !!result[0]),
                        map(result => result[0].filter(item => item.type === result[1])),
                        map(getSortedGroups));

  queryResultsCount =
      combineLatest(
          this.repoDao.repo, this.queryGroups, this.issueRecommendations.recommendations, this.type)
          .pipe(
              filter(result => !!result[0] && !!result[1] && !!result[2]), delay(1000),
              map(result => {
                const repo = result[0] as Repo;
                const groups = result[1] as QueryGroup[];
                const recommendations = result[2] as Map<number, Recommendation[]>;
                const type = result[3] as ItemType;
                const items =
                    type === 'issue' ? repo.issues : type === 'pr' ? repo.pullRequests : [];

                const map = new Map<string, number>();
                groups.forEach(group => group.queries.forEach(query => {
                  const filterer = new IssueFilterer(query.options.filters, repo, recommendations);
                  const count =
                      getIssuesMatchingFilterAndSearch(items, filterer, query.options.search)
                          .length;
                  map.set(query.id, count);
                }));

                return map;
              }));

  queryKeyTrackBy = (_i, itemQuery: ItemQuery) => itemQuery.id;

  constructor(
      public issueQueriesDao: IssueQueriesDao, public repoDao: RepoDao, private router: Router,
      private activatedRoute: ActivatedRoute, private issueRecommendations: IssueRecommendations,
      public recommendationsDao: RecommendationsDao,
      private activatedRepository: ActivatedRepository) {}

  createQuery(type: ItemType) {
    this.router.navigate(
        [`${this.activatedRepository.repository.value}/query/new`], {queryParams: {type}});
  }

  createQueryFromRecommendation(recommendation: Recommendation) {
    this.router.navigate(
        [`${this.activatedRepository.repository.value}/query/new`],
        {queryParams: {'recommendationId': recommendation.id}});
  }

  navigateToQuery(id: string) {
    this.router.navigate([`${this.activatedRepository.repository.value}/query/${id}`]);
  }
}


function getSortedGroups(queries: ItemQuery[]) {
  const groups = new Map<string, ItemQuery[]>();
  queries.forEach(query => {
    const group = query.group || 'Other';
    if (!groups.has(group)) {
      groups.set(group, []);
    }

    groups.get(group).push(query);
  });

  const sortedGroups: QueryGroup[] = [];
  Array.from(groups.keys()).sort().forEach(group => {
    const queries = groups.get(group);
    queries.sort((a, b) => a.name < b.name ? -1 : 1);
    sortedGroups.push({name: group, queries});
  });

  return sortedGroups;
}
