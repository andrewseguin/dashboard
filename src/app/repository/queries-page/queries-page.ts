import {CdkPortal} from '@angular/cdk/portal';
import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {DataSource} from 'app/package/component/dashboard/widget-view/widget-view';
import {Observable} from 'rxjs';
import {delay, map, mergeMap} from 'rxjs/operators';
import {Header} from '../services';
import {ActiveStore} from '../services/active-repo';
import {Query} from '../services/dao/config/query';
import {Recommendation} from '../services/dao/config/recommendation';
import {getItemsList, GithubItemGroupsDataSource} from '../services/github-item-groups-data-source';
import {ItemRecommendations} from '../services/item-recommendations';

interface QueryGroup {
  queries: {id: string, name: string, count: Observable<number>}[];
  name: string;
}

@Component({
  styleUrls: ['queries-page.scss'],
  templateUrl: 'queries-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueriesPage {
  dataSources = new Map<string, DataSource>([
    [
      'issue', {
        id: 'issue',
        label: 'Issues',
        factory:
            () => {
              const datasource =
                  new GithubItemGroupsDataSource(this.itemRecommendations, this.activeRepo);
              datasource.dataProvider = getItemsList(this.activeRepo.activeData, 'issue');
              return datasource;
            }
      }
    ],
    [
      'pr', {
        id: 'pr',
        label: 'Pull Requests',
        factory:
            () => {
              const datasource =
                  new GithubItemGroupsDataSource(this.itemRecommendations, this.activeRepo);
              datasource.dataProvider = getItemsList(this.activeRepo.activeData, 'pr');
              return datasource;
            }
      }
    ],
  ]);

  dataSourceTypes: string[] = [];

  recommendationsList =
      this.activeRepo.config.pipe(mergeMap(configStore => configStore.recommendations.list));

  queries = this.activeRepo.config.pipe(mergeMap(configStore => configStore.queries.list));

  queryGroups = this.queries.pipe(map(queries => this.getSortedGroups(queries)));

  queryKeyTrackBy = (_i: number, itemQuery: Query) => itemQuery.id;

  @ViewChild(CdkPortal) toolbarActions: CdkPortal;

  constructor(
      private itemRecommendations: ItemRecommendations, private header: Header,
      private router: Router, private issueRecommendations: ItemRecommendations,
      private activeRepo: ActiveStore) {
    this.dataSources.forEach(dataSource => this.dataSourceTypes.push(dataSource.id));
  }

  ngOnInit() {
    this.header.toolbarOutlet.next(this.toolbarActions);
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

  ngOnDestroy() {
    this.header.toolbarOutlet.next(null);
  }

  private getQueryCount(query: Query): Observable<number> {
    const dataSource = new GithubItemGroupsDataSource(this.issueRecommendations, this.activeRepo);
    dataSource.dataProvider = getItemsList(this.activeRepo.activeData, query.dataSourceType!);

    if (query.filtererState) {
      dataSource.filterer.setState(query.filtererState!);
    }

    return dataSource.connect().pipe(delay(250), map(result => result.count));
  }

  private getSortedGroups(queries: Query[]) {
    const groups = new Map<string, {id: string, name: string, count: Observable<number>}[]>();
    queries.forEach(query => {
      const group = query.group || 'Other';
      if (!groups.has(group)) {
        groups.set(group, []);
      }

      groups.get(group)!.push({id: query.id!, name: query.name!, count: this.getQueryCount(query)});
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
