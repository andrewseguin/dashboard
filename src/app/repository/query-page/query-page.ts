import {CdkPortal} from '@angular/cdk/portal';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ItemViewer} from 'app/package/items-renderer/item-viewer';
import {isMobile} from 'app/utility/media-matcher';
import {Subject, Subscription} from 'rxjs';
import {map, take, takeUntil} from 'rxjs/operators';
import {Header} from '../services';
import {ActiveRepo} from '../services/active-repo';
import {ItemType} from '../services/dao';
import {RepoStore} from '../services/dao/dao';
import {Widget} from '../services/dao/dashboard';
import {Query} from '../services/dao/query';
import {getItemsList, GithubItemsRenderer} from '../services/github-items-renderer';
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
      this.itemsRenderer.dataProvider = getItemsList(this.activeRepo.activeStore, type);
    }

    this.updateQueryStates();

    this.header.title.next(this.query.name || '');
    this.setBack();
  }
  get query(): Query {
    return this._query;
  }
  private _query: Query;

  set currentOptions(currentOptions: ItemRendererOptionsState) {
    // When current options change, a check should be evaluated if they differ
    // from the current query's options. If so, the save button should
    // display.
    this._currentOptions = currentOptions;
    this.canSave = !!this.query && !!this.query.options && this.currentOptions &&
        !areOptionStatesEqual(this.query.options, this.currentOptions);
  }
  get currentOptions(): ItemRendererOptionsState {
    return this._currentOptions;
  }
  private _currentOptions: ItemRendererOptionsState;

  canSave: boolean;

  itemId =
      this.activatedRoute.queryParamMap.pipe(map(queryParamsMap => queryParamsMap.get('item')));

  private destroyed = new Subject();
  private getSubscription: Subscription;

  public itemsRenderer = new GithubItemsRenderer(this.itemRecommendations, this.activeRepo);

  public itemViewer = new ItemViewer<GithubItemView>(GithubItemViewerMetadata);


  @ViewChild(CdkPortal) toolbarActions: CdkPortal;

  constructor(
      private router: Router, private activatedRoute: ActivatedRoute,
      private itemRecommendations: ItemRecommendations, private activeRepo: ActiveRepo,
      private header: Header, private queryDialog: QueryDialog, private cd: ChangeDetectorRef) {
    this.activatedRoute.params.pipe(takeUntil(this.destroyed)).subscribe(params => {
      const id = params['id'];
      this.canSave = false;

      if (this.getSubscription) {
        this.getSubscription.unsubscribe();
      }

      if (id === 'new') {
        const queryParamMap = this.activatedRoute.snapshot.queryParamMap;
        const recommendationId = queryParamMap.get('recommendationId');
        const widgetJson = queryParamMap.get('widget');
        const dashboard = queryParamMap.get('dashboard');

        if (recommendationId) {
          this.createNewQueryFromRecommendation(this.activeRepo.activeStore, recommendationId);
        } else if (widgetJson) {
          const widget: Widget = JSON.parse(widgetJson);
          this.query = createNewQuery(widget.itemType, widget.title, widget.options);
        } else {
          const type = queryParamMap.get('type') as ItemType;
          this.query = createNewQuery(type);
        }

        // If navigated from dashboard, go back to the dashboard, not queries page
        if (dashboard) {
          this.setBack(dashboard);
        }
        this.cd.markForCheck();
      } else {
        this.getSubscription =
            this.activeRepo.activeStore.queries.map.pipe(takeUntil(this.destroyed))
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

  saveAs() {
    const queryType = this.query.type;
    if (!queryType) {
      throw Error('Missing query type');
    }
    this.queryDialog.saveAsQuery(this.currentOptions, queryType, this.activeRepo.activeStore);
  }

  save() {
    this.activeRepo.activeStore.queries.update({id: this.query.id, options: this.currentOptions});
  }

  setBack(fromDashboard?: string) {
    if (fromDashboard) {
      this.header.goBack = () =>
          this.router.navigate([`/${this.activeRepo.activeRepository}/dashboard/${fromDashboard}`]);
    } else {
      this.header.goBack = () =>
          this.router.navigate([`/${this.activeRepo.activeRepository}/queries/${this.query.type}`]);
    }
  }

  private createNewQueryFromRecommendation(store: RepoStore, id: string) {
    store.recommendations.list.pipe(take(1)).subscribe(list => {
      list.forEach(r => {
        if (r.id === id) {
          const options = new ItemRendererOptions();
          options.filters = r.filters || [];
          options.search = r.search || '';
          this.query = createNewQuery('issue', r.message, options.getState());
          this.cd.markForCheck();
        }
      });
    });
  }

  private updateQueryStates() {
    const grouperState = this.query.grouperState;
    if (grouperState) {
      this.itemsRenderer.grouper.setState(grouperState);
    }

    const sorterState = this.query.sorterState;
    if (sorterState) {
      this.itemsRenderer.sorter.setState(sorterState);
    }

    const filtererState = this.query.filtererState;
    if (filtererState) {
      this.itemsRenderer.filterer.setState(filtererState);
    }

    const viewerState = this.query.viewerState;
    if (viewerState) {
      this.itemViewer.setState(viewerState);
    }
  }
}

function createNewQuery(
    type: ItemType, name = 'New Query', optionsState: ItemRendererOptionsState|null = null): Query {
  const options = new ItemRendererOptions();

  if (optionsState) {
    options.setState(optionsState);
  }

  return {name, type, options: options.getState()};
}
