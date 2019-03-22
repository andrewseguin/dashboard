import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {combineLatest, Observable} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';
import {ActiveStore} from '../services/active-repo';
import {Query} from '../services/dao/config/query';
import {Recommendation} from '../services/dao/config/recommendation';
import {getItemsList, GithubItemGroupsDataSource} from '../services/github-item-groups-data-source';
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
  type: Observable<string> = this.activatedRoute.params.pipe(map(params => params.type));

  recommendationsList =
      this.activeRepo.config.pipe(mergeMap(configStore => configStore.recommendations.list));

  queryGroups = this.activeRepo.config.pipe(
      mergeMap(configStore => combineLatest(configStore.queries.list, this.type)),
      map(result => result[0].filter(query => query.dataSourceType === result[1])),
      map(getSortedGroups));

  queryResultsCount = this.activeRepo.config.pipe(
      mergeMap(config => combineLatest(config.queries.list, this.type)), map(results => {
        const queries = results[0].filter(query => query.dataSourceType === results[1]);

        const queryCountMap = new Map<string, Observable<number>>();
        queries.forEach(query => {
          const dataSource =
              new GithubItemGroupsDataSource(this.issueRecommendations, this.activeRepo);
          dataSource.dataProvider = getItemsList(this.activeRepo.activeData, 'issue');

          if (query.filtererState) {
            dataSource.filterer.setState(query.filtererState!);
          }
          queryCountMap.set(query.id!, dataSource.connect().pipe(map(result => result.count)));
        });

        return queryCountMap;
      }));

  queryKeyTrackBy = (_i: number, itemQuery: Query) => itemQuery.id;

  constructor(
      private router: Router, private activatedRoute: ActivatedRoute,
      private issueRecommendations: ItemRecommendations, private activeRepo: ActiveStore) {}

  createQuery(type: string) {
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
