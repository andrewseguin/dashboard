import { CdkPortal } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataSourceProvider } from 'app/package/data-source/data-source-provider';
import { Observable, Subject } from 'rxjs';
import { delay, map, mergeMap, takeUntil } from 'rxjs/operators';
import { DATA_SOURCES } from '../repository';
import { ActiveStore } from '../services/active-store';
import { Query } from '../services/dao/config/query';
import { Recommendation } from '../services/dao/config/recommendation';
import { Header } from '../services/header';

interface QueryListItem {
  id: string;
  name: string;
  type: string;
  count: Observable<number>;
}

interface QueryGroup {
  queries: QueryListItem[];
  name: string;
}

@Component({
  styleUrls: ['queries-page.scss'],
  templateUrl: 'queries-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueriesPage {
  dataSourceTypes: string[] = [];

  recommendationsList =
      this.activeRepo.config.pipe(mergeMap(configStore => configStore.recommendations.list));

  queries =
      this.activeRepo.config.pipe(delay(100), mergeMap(configStore => configStore.queries.list));

  queryGroups = this.queries.pipe(map(queries => this.getSortedGroups(queries)));

  queryKeyTrackBy = (_i: number, itemQuery: Query) => itemQuery.id;

  @ViewChild(CdkPortal) toolbarActions: CdkPortal;

  private destroyed = new Subject();

  constructor(
      @Inject(DATA_SOURCES) private dataSources: Map<string, DataSourceProvider>,
      private header: Header, private router: Router, private activeRepo: ActiveStore) {
    this.dataSources.forEach(dataSource => this.dataSourceTypes.push(dataSource.id));
  }

  ngOnInit() {
    this.queries.pipe(takeUntil(this.destroyed)).subscribe(list => {
      if (list.length) {
        this.header.toolbarOutlet.next(this.toolbarActions);
      } else {
        this.header.toolbarOutlet.next(null);
      }
    });
  }

  ngOnDestroy() {
    this.header.toolbarOutlet.next(null);
    this.destroyed.next();
    this.destroyed.complete();
  }

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

  private getQueryCount(query: Query): Observable<number> {
    const dataSource = this.dataSources.get(query.dataSourceType!)!.factory();

    if (query.filtererState) {
      dataSource.filterer.setState(query.filtererState!);
    }

    return dataSource.connect().pipe(delay(250), map(result => result.count));
  }

  private getSortedGroups(queries: Query[]) {
    const groups = new Map<string, QueryListItem[]>();
    queries.forEach(query => {
      const group = query.group || 'Other';
      if (!groups.has(group)) {
        groups.set(group, []);
      }

      groups.get(group)!.push({
        id: query.id!,
        name: query.name!,
        count: this.getQueryCount(query),
        type: query.dataSourceType!,
      });
    });

    const sortedGroups: QueryGroup[] = [];
    Array.from(groups.keys()).sort().forEach(group => {
      const queries = groups.get(group)!;
      queries.sort((a, b) => (a.name! < b.name!) ? -1 : 1);
      sortedGroups.push({name: group, queries});
    });

    return sortedGroups;
  }
}
