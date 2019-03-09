import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ItemType} from 'app/service/github';
import {Repo, RepoDao} from 'app/service/repo-dao';
import {combineLatest, Observable} from 'rxjs';
import {delay, filter, map} from 'rxjs/operators';

import {ActivatedRepository} from '../services/activated-repository';
import {QueriesDao, Query} from '../services/dao/queries-dao';
import {Recommendation, RecommendationsDao} from '../services/dao/recommendations-dao';
import {ItemRecommendations} from '../services/item-recommendations';
import {ItemFilterer} from '../services/items-renderer/item-filterer';
import {getItemsMatchingFilterAndSearch} from '../utility/get-items-matching-filter-and-search';


interface QueryGroup {
  queries: Query[];
  name: string;
}

@Component({
  styleUrls: ['queries-page.scss'],
  templateUrl: 'queries-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueriesPage {
  type: Observable<ItemType> = this.activatedRoute.params.pipe(map(params => params.type));

  queryGroups = combineLatest(this.queriesDao.list, this.type)
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
                  const filterer = new ItemFilterer(query.options.filters, repo, recommendations);
                  const count =
                      getItemsMatchingFilterAndSearch(items, filterer, query.options.search).length;
                  map.set(query.id, count);
                }));

                return map;
              }));

  queryKeyTrackBy = (_i, itemQuery: Query) => itemQuery.id;

  constructor(
      public queriesDao: QueriesDao, public repoDao: RepoDao, private router: Router,
      private activatedRoute: ActivatedRoute, private issueRecommendations: ItemRecommendations,
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


function getSortedGroups(queries: Query[]) {
  const groups = new Map<string, Query[]>();
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
