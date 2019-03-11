import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ItemFilterer} from 'app/package/items-renderer/item-filterer';
import {RepoDao} from 'app/repository/services/dao/repo-dao';
import {combineLatest, Observable} from 'rxjs';
import {delay, filter, map} from 'rxjs/operators';
import {ActivatedRepository} from '../services/activated-repository';
import {Item, ItemsDao, ItemType, LabelsDao} from '../services/dao';
import {QueriesDao, Query} from '../services/dao/queries-dao';
import {Recommendation, RecommendationsDao} from '../services/dao/recommendations-dao';
import {ItemRecommendations} from '../services/item-recommendations';
import {ItemsFilterMetadata, MatcherContext} from '../utility/items-renderer/items-filter-metadata';
import {tokenizeItem} from '../utility/tokenize-item';


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
                        filter(result => result.every(r => !!r)),
                        map(result => result[0].filter(item => item.type === result[1])),
                        map(getSortedGroups));

  queryResultsCount =
      combineLatest(
          this.itemsDao.list, this.queryGroups, this.issueRecommendations.recommendations,
          this.type, this.labelsDao.map)
          .pipe(filter(result => result.every(r => !!r)), delay(1000), map(result => {
                  console.log(result);
                  const groups = result[1];
                  const recommendationsByItem = result[2];
                  const type = result[3];
                  const labelsMap = result[4];

                  const issues = result[0].filter(item => !item.pr);
                  const pullRequests = result[0].filter(item => !!item.pr);
                  const items = type === 'issue' ? issues : type === 'pr' ? pullRequests : [];

                  console.log(issues);

                  const map = new Map<string, number>();
                  groups.forEach(group => group.queries.forEach(query => {
                    const contextProvider = (item: Item) => {
                      return {
                        item,
                        labelsMap,
                        recommendations: recommendationsByItem.get(item.id),
                      };
                    };
                    const filterer = new ItemFilterer<Item, MatcherContext>(
                        contextProvider, tokenizeItem, ItemsFilterMetadata);
                    const count =
                        filterer.filter(items, query.options.filters, query.options.search).length;
                    map.set(query.id, count);
                  }));

                  return map;
                }));

  queryKeyTrackBy = (_i, itemQuery: Query) => itemQuery.id;

  constructor(
      private itemsDao: ItemsDao, public queriesDao: QueriesDao, public repoDao: RepoDao,
      private router: Router, private labelsDao: LabelsDao, private activatedRoute: ActivatedRoute,
      private issueRecommendations: ItemRecommendations,
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
