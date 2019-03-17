import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ItemFilterer} from 'app/package/items-renderer/item-filterer';
import {combineLatest, Observable} from 'rxjs';
import {delay, filter, map, mergeMap} from 'rxjs/operators';
import {ActiveRepo} from '../services/active-repo';
import {Item, ItemType} from '../services/dao';
import {Query} from '../services/dao/query';
import {Recommendation} from '../services/dao/recommendation';
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

  recommendationsList = this.activeRepo.store.pipe(mergeMap(store => store.recommendations.list));

  queryGroups = this.activeRepo.store.pipe(
      mergeMap(store => combineLatest(store.queries.list, this.type)),
      map(result => result[0].filter(item => item.type === result[1])), map(getSortedGroups));

  queryResultsCount = this.activeRepo.store.pipe(
      mergeMap(
          store => combineLatest(
              store.items.list, this.queryGroups, this.issueRecommendations.allRecommendations,
              this.type, store.labels.map)),
      filter(result => result.every(r => !!r)), delay(1000), map(result => {
        const items = result[0];
        const groups = result[1];
        const recommendationsByItem = result[2];
        const type = result[3];
        const labelsMap = result[4];

        const issues = items.filter(item => !item.pr);
        const pullRequests = items.filter(item => !!item.pr);
        const itemsToFilter = type === 'issue' ? issues : type === 'pr' ? pullRequests : [];

        const map = new Map<string, number>();
        groups.forEach(group => group.queries.forEach(query => {
          const contextProvider = (item: Item) => {
            // Add name to labels map for filtering
            labelsMap.forEach(label => labelsMap.set(label.name, label));

            return {
              item,
              labelsMap,
              recommendations: recommendationsByItem.get(item.id) || [],
            };
          };
          const filterer = new ItemFilterer<Item, MatcherContext>(
              contextProvider, tokenizeItem, ItemsFilterMetadata);
          const filters = query.options ? query.options.filters : [];
          const search = query.options ? query.options.search : '';
          const count = filterer.filter(itemsToFilter, filters, search).length;
          map.set(query.id!, count);
        }));

        return map;
      }));

  queryKeyTrackBy = (_i: number, itemQuery: Query) => itemQuery.id;

  constructor(
      private router: Router, private activatedRoute: ActivatedRoute,
      private issueRecommendations: ItemRecommendations, private activeRepo: ActiveRepo) {}

  createQuery(type: ItemType) {
    this.router.navigate([`${this.activeRepo.activeRepository}/query/new`], {queryParams: {type}});
  }

  createQueryFromRecommendation(recommendation: Recommendation) {
    this.router.navigate(
        [`${this.activeRepo.activeRepository}/query/new`],
        {queryParams: {'recommendationId': recommendation.id}});
  }

  navigateToQuery(id: string) {
    this.router.navigate([`${this.activeRepo.activeRepository}/query/${id}`]);
  }
}


function getSortedGroups(queries: Query[]) {
  const groups = new Map<string, Query[]>();
  queries.forEach(query => {
    const group = query.group || 'Other';
    if (!groups.has(group)) {
      groups.set(group, []);
    }

    groups.get(group)!.push(query);
  });

  const sortedGroups: QueryGroup[] = [];
  Array.from(groups.keys()).sort().forEach(group => {
    const queries = groups.get(group)!;
    queries.sort((a, b) => (a.name! < b.name!) ? -1 : 1);
    sortedGroups.push({name: group, queries});
  });

  return sortedGroups;
}
