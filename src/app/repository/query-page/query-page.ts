import {CdkPortal} from '@angular/cdk/portal';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ItemViewer} from 'app/package/items-renderer/item-viewer';
import {isMobile} from 'app/utility/media-matcher';
import {combineLatest, Subject, Subscription} from 'rxjs';
import {map, take, takeUntil} from 'rxjs/operators';
import {Header} from '../services';
import {ActiveStore} from '../services/active-store';
import {ItemType} from '../services/dao';
import {ConfigStore} from '../services/dao/config/config-dao';
import {Widget} from '../services/dao/config/dashboard';
import {Query} from '../services/dao/config/query';
import {getItemsList, GithubItemGroupsDataSource} from '../services/github-item-groups-data-source';
import {ItemRecommendations} from '../services/item-recommendations';
import {QueryDialog} from '../shared/dialog/query/query-dialog';
import {
  GithubItemView,
  GithubItemViewerMetadata
} from '../utility/items-renderer/item-viewer-metadata';


@Component({
  styleUrls: ['query-page.scss'],
  templateUrl: 'query-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'[class.is-mobile]': 'isMobile()'}
})
export class QueryPage {
  isMobile = isMobile;

  set query(query: Query) {
    this._query = query;

    const type = this._query.type;
    if (type) {
      this.itemGroupsDataSource.dataProvider = getItemsList(this.activeStore.activeData, type);
    }

    this.updateQueryStates();

    this.header.title.next(this.query.name || '');
    this.setBack();
  }
  get query(): Query {
    return this._query;
  }
  private _query: Query;

  itemId =
      this.activatedRoute.queryParamMap.pipe(map(queryParamsMap => queryParamsMap.get('item')));

  private destroyed = new Subject();
  private getSubscription: Subscription;

  public itemGroupsDataSource =
      new GithubItemGroupsDataSource(this.itemRecommendations, this.activeStore);

  public itemViewer = new ItemViewer<GithubItemView>(GithubItemViewerMetadata);

  public canSave =
      combineLatest(
          this.itemGroupsDataSource.filterer.state, this.itemGroupsDataSource.grouper.state,
          this.itemGroupsDataSource.sorter.state, this.itemViewer.state)
          .pipe(map(() => !this.areStatesEquivalent()));

  @ViewChild(CdkPortal) toolbarActions: CdkPortal;

  constructor(
      private router: Router, private activatedRoute: ActivatedRoute,
      private itemRecommendations: ItemRecommendations, private activeStore: ActiveStore,
      private header: Header, private queryDialog: QueryDialog, private cd: ChangeDetectorRef) {
    this.activatedRoute.params.pipe(takeUntil(this.destroyed)).subscribe(params => {
      const id = params['id'];

      if (this.getSubscription) {
        this.getSubscription.unsubscribe();
      }

      if (id === 'new') {
        const queryParamMap = this.activatedRoute.snapshot.queryParamMap;
        const recommendationId = queryParamMap.get('recommendationId');
        const widgetJson = queryParamMap.get('widget');
        const dashboard = queryParamMap.get('dashboard');

        if (recommendationId) {
          this.createNewQueryFromRecommendation(this.activeStore.activeConfig, recommendationId);
        } else if (widgetJson) {
          const widget: Widget = JSON.parse(widgetJson);
          this.query = createNewQuery(widget.title, widget.itemType);
          // TODO: widget.options
        } else {
          const type = queryParamMap.get('type') as ItemType;
          this.query = createNewQuery('New Query', type);
        }

        // If navigated from dashboard, go back to the dashboard, not queries page
        if (dashboard) {
          this.setBack(dashboard);
        }
        this.cd.markForCheck();
      } else {
        this.getSubscription =
            this.activeStore.activeConfig.queries.map.pipe(takeUntil(this.destroyed))
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
    const queryType = this.query.type;
    if (!queryType) {
      throw Error('Missing query type');
    }
    this.queryDialog.saveAsQuery().pipe(take(1)).subscribe(
        result => this.saveAs(result.name, result.group));
  }

  saveState() {
    const queryState = {
      filtererState: this.itemGroupsDataSource.filterer.getState(),
      grouperState: this.itemGroupsDataSource.grouper.getState(),
      sorterState: this.itemGroupsDataSource.sorter.getState(),
      viewerState: this.itemViewer.getState(),
    };

    this.activeStore.activeConfig.queries.update({...this.query, ...queryState});
  }

  saveAs(name: string, group: string) {
    this.query = {...this.query, name, group};
    const store = this.activeStore.activeConfig;
    const newQueryId = store.queries.add(this.query);

    this.saveState();

    this.router.navigate(
        [`${this.activeStore.activeData.name}/query/${newQueryId}`],
        {replaceUrl: true, queryParamsHandling: 'merge'});
  }

  setBack(fromDashboard?: string) {
    if (fromDashboard) {
      this.header.goBack = () =>
          this.router.navigate([`/${this.activeStore.activeName}/dashboard/${fromDashboard}`]);
    } else {
      this.header.goBack = () =>
          this.router.navigate([`/${this.activeStore.activeName}/queries/${this.query.type}`]);
    }
  }

  private createNewQueryFromRecommendation(store: ConfigStore, id: string) {
    store.recommendations.list.pipe(take(1)).subscribe(list => {
      list.forEach(r => {
        if (r.id === id) {
          this.query = createNewQuery('New Query', 'issue');
          this.cd.markForCheck();
        }
      });
    });
  }

  private updateQueryStates() {
    const grouperState = this.query.grouperState;
    if (grouperState) {
      this.itemGroupsDataSource.grouper.setState(grouperState);
    }

    const sorterState = this.query.sorterState;
    if (sorterState) {
      this.itemGroupsDataSource.sorter.setState(sorterState);
    }

    const filtererState = this.query.filtererState;
    if (filtererState) {
      this.itemGroupsDataSource.filterer.setState(filtererState);
    }

    const viewerState = this.query.viewerState;
    if (viewerState) {
      this.itemViewer.setState(viewerState);
    }
  }

  private areStatesEquivalent() {
    const filtererStatesEquivalent = this.query.filtererState &&
        this.itemGroupsDataSource.filterer.isEquivalent(this.query.filtererState);
    const grouperStatesEquivalent = this.query.grouperState &&
        this.itemGroupsDataSource.grouper.isEquivalent(this.query.grouperState);
    const sorterStatesEquivalent = this.query.sorterState &&
        this.itemGroupsDataSource.sorter.isEquivalent(this.query.sorterState);
    const viewerStatesEquivalent =
        this.query.viewerState && this.itemViewer.isEquivalent(this.query.viewerState);

    return filtererStatesEquivalent && grouperStatesEquivalent && sorterStatesEquivalent &&
        viewerStatesEquivalent;
  }
}

function createNewQuery(name: string, type: ItemType): Query {
  return {name, type};
}
