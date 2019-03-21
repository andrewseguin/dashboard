import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {combineLatest, Observable} from 'rxjs';
import {delay, filter, map, mergeMap} from 'rxjs/operators';
import {ActiveStore} from '../services/active-repo';
import {ItemType} from '../services/dao';
import {Query} from '../services/dao/config/query';
import {Recommendation} from '../services/dao/config/recommendation';
import {ItemRecommendations} from '../services/item-recommendations';


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

  recommendationsList =
      this.activeRepo.config.pipe(mergeMap(configStore => configStore.recommendations.list));

  queryGroups = this.activeRepo.config.pipe(
      mergeMap(configStore => combineLatest(configStore.queries.list, this.type)),
      map(result => result[0].filter(item => item.type === result[1])), map(getSortedGroups));

  queryResultsCount = this.activeRepo.data.pipe(
      mergeMap(
          store => combineLatest(
              store.items.list, this.queryGroups, this.issueRecommendations.allRecommendations,
              this.type, store.labels.map)),
      filter(result => result.every(r => !!r)), delay(1000), map(() => {
        // TODO: Reimplement with the renderer
        return 0;
      }));

  queryKeyTrackBy = (_i: number, itemQuery: Query) => itemQuery.id;

  constructor(
      private router: Router, private activatedRoute: ActivatedRoute,
      private issueRecommendations: ItemRecommendations, private activeRepo: ActiveStore) {}

  createQuery(type: ItemType) {
    this.router.navigate([`${this.activeRepo.activeName}/query/new`], {queryParams: {type}});
  }

  createQueryFromRecommendation(recommendation: Recommendation) {
    this.router.navigate(
        [`${this.activeRepo.activeName}/query/new`],
        {queryParams: {'recommendationId': recommendation.id}});
  }

  navigateToQuery(id: string) {
    this.router.navigate([`${this.activeRepo.activeName}/query/${id}`]);
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
