import {CdkPortal} from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  ViewChild
} from '@angular/core';
import {MatDialog} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {Item} from 'app/github/app-types/item';
import {Widget} from 'app/package/component/widget/widget';
import {DataSource} from 'app/package/data-source/data-source';
import {Filterer} from 'app/package/data-source/filterer';
import {Grouper} from 'app/package/data-source/grouper';
import {Provider} from 'app/package/data-source/provider';
import {Sorter} from 'app/package/data-source/sorter';
import {Viewer} from 'app/package/data-source/viewer';
import {DataSourceProvider} from 'app/package/utility/data-source-provider';
import {isMobile} from 'app/utility/media-matcher';
import {combineLatest, Observable, Subject, Subscription} from 'rxjs';
import {map, take, takeUntil} from 'rxjs/operators';
import {DATA_SOURCES} from '../repository';
import {ActiveStore} from '../services/active-store';
import {ConfigStore} from '../services/dao/config/config-dao';
import {Query} from '../services/dao/config/query';
import {Header} from '../services/header';
import {ItemDetailDialog} from '../shared/dialog/item-detail-dialog/item-detail-dialog';
import {QueryDialog} from '../shared/dialog/query/query-dialog';

@Component({
  styleUrls: ['query-page.scss'],
  templateUrl: 'query-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'[class.is-mobile]': 'isMobile()'}
})
export class QueryPage<T> {
  isMobile = isMobile;

  filterer: Filterer<T>;

  grouper: Grouper<T>;

  sorter: Sorter<T>;

  provider: Provider<T>;

  viewer: Viewer<T, any, any>;

  set query(query: Query) {
    this._query = query;

    const type = this._query.dataSourceType!;
    const dataSourceProvider = this.dataSources.get(type)!;
    this.dataSource = dataSourceProvider.factory();
    this.viewer = dataSourceProvider.viewer();
    this.filterer = dataSourceProvider.filterer();
    this.grouper = dataSourceProvider.grouper();
    this.sorter = dataSourceProvider.sorter();
    this.provider = dataSourceProvider.provider();


    // TODO: Needs to be unsubscribed when query switches
    this.canSave =
        combineLatest(this.filterer.state, this.grouper.state, this.sorter.state, this.viewer.state)
            .pipe(map(() => !this.areStatesEquivalent()));
    this.activeItem =
        combineLatest(
            this.dataSource.connect(this.provider, this.filterer, this.grouper, this.sorter),
            this.itemId)
            .pipe(map(results => {
              for (let group of results[0]) {
                for (let item of group.items) {
                  // TODO: Cannot assume this is item, need another way to equate
                  if ((item as any as Item).id === results[1]) {
                    return item;
                  }
                }
              }
              return null;
            }));

    this.updateQueryStates();

    this.header.title.next(this.query.name || '');
    this.header.goBack = true;
  }
  get query(): Query {
    return this._query;
  }
  private _query: Query;

  itemId =
      this.activatedRoute.queryParamMap.pipe(map(queryParamsMap => queryParamsMap.get('item')));

  private destroyed = new Subject();
  private getSubscription: Subscription;

  public dataSource: DataSource<T>;

  public canSave: Observable<boolean>;

  public activeItem: Observable<T|null>;

  @ViewChild(CdkPortal) toolbarActions: CdkPortal;

  constructor(
      @Inject(DATA_SOURCES) public dataSources: Map<string, DataSourceProvider>,
      private dialog: MatDialog, private router: Router, private activatedRoute: ActivatedRoute,
      private activeRepo: ActiveStore, private header: Header, private queryDialog: QueryDialog,
      private cd: ChangeDetectorRef) {
    this.activatedRoute.params.pipe(takeUntil(this.destroyed)).subscribe(params => {
      const id = params['id'];

      if (this.getSubscription) {
        this.getSubscription.unsubscribe();
      }

      if (id === 'new') {
        const queryParamMap = this.activatedRoute.snapshot.queryParamMap;
        const recommendationId = queryParamMap.get('recommendationId');
        const widgetJson = queryParamMap.get('widget');

        if (recommendationId) {
          this.createNewQueryFromRecommendation(this.activeRepo.activeConfig, recommendationId);
        } else if (widgetJson) {
          const widget: Widget = JSON.parse(widgetJson);
          this.query = createNewQuery(widget.title || 'Widget', widget.dataSourceType || 'issue');
          if (widget.filtererState) {
            this.filterer.setState(widget.filtererState);
          }
        } else {
          const type = queryParamMap.get('type') || '';
          this.query = createNewQuery('New Query', type);
        }

        this.cd.markForCheck();
      } else {
        this.getSubscription =
            this.activeRepo.activeConfig.queries.map.pipe(takeUntil(this.destroyed))
                .subscribe(map => {
                  const query = map.get(id);
                  if (query) {
                    this.query = query;
                  }
                  this.cd.markForCheck();
                });
      }
    });
  }

  ngOnInit() {
    this.header.toolbarOutlet.next(this.toolbarActions);
  }

  ngOnDestroy() {
    this.header.toolbarOutlet.next(null);
    this.destroyed.next();
    this.destroyed.complete();
  }

  openSaveAsDialog() {
    const queryType = this.query.dataSourceType;
    if (!queryType) {
      throw Error('Missing query type');
    }
    this.queryDialog.saveAsQuery().pipe(take(1)).subscribe(
        result => this.saveAs(result.name, result.group));
  }

  saveState() {
    const queryState = {
      filtererState: this.filterer.getState(),
      grouperState: this.grouper.getState(),
      sorterState: this.sorter.getState(),
      viewerState: this.viewer.getState(),
    };

    this.activeRepo.activeConfig.queries.update({...this.query, ...queryState});
  }

  saveAs(name: string, group: string) {
    this.query = {...this.query, name, group};
    const store = this.activeRepo.activeConfig;
    const newQueryId = store.queries.add(this.query);

    this.saveState();

    this.router.navigate(
        [`${this.activeRepo.activeData.name}/query/${newQueryId}`],
        {replaceUrl: true, queryParamsHandling: 'merge'});
  }

  navigateToItem(itemId: number) {
    if (!isMobile()) {
      this.router.navigate([], {
        relativeTo: this.activatedRoute.parent,
        queryParams: {item: itemId},
        replaceUrl: true,
        queryParamsHandling: 'merge',
      });
    } else {
      this.dialog.open(ItemDetailDialog, {data: {itemId}});
    }
  }

  private createNewQueryFromRecommendation(store: ConfigStore, id: string) {
    store.recommendations.list.pipe(take(1)).subscribe(list => {
      list.forEach(r => {
        if (r.id === id) {
          this.query = createNewQuery('New Query', 'issue');
          if (r.filtererState) {
            this.filterer.setState(r.filtererState);
          }
          this.cd.markForCheck();
        }
      });
    });
  }

  private updateQueryStates() {
    const grouperState = this.query.grouperState;
    if (grouperState) {
      this.grouper.setState(grouperState);
    }

    const sorterState = this.query.sorterState;
    if (sorterState) {
      this.sorter.setState(sorterState);
    }

    const filtererState = this.query.filtererState;
    if (filtererState) {
      this.filterer.setState(filtererState);
    }

    const viewerState = this.query.viewerState;
    if (viewerState) {
      this.viewer.setState(viewerState);
    }
  }

  private areStatesEquivalent() {
    const filtererStatesEquivalent =
        this.query.filtererState && this.filterer.isEquivalent(this.query.filtererState);
    const grouperStatesEquivalent =
        this.query.grouperState && this.grouper.isEquivalent(this.query.grouperState);
    const sorterStatesEquivalent =
        this.query.sorterState && this.sorter.isEquivalent(this.query.sorterState);
    const viewerStatesEquivalent =
        this.query.viewerState && this.viewer.isEquivalent(this.query.viewerState);

    return filtererStatesEquivalent && grouperStatesEquivalent && sorterStatesEquivalent &&
        viewerStatesEquivalent;
  }
}

function createNewQuery(name: string, dataSourceType: string): Query {
  return {name, dataSourceType};
}
