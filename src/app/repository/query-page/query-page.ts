import {CdkPortal} from '@angular/cdk/portal';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
  areOptionStatesEqual,
  ItemRendererOptions,
  ItemRendererOptionsState
} from 'app/package/items-renderer/item-renderer-options';
import {isMobile} from 'app/utility/media-matcher';
import {Subject, Subscription} from 'rxjs';
import {filter, map, take, takeUntil} from 'rxjs/operators';
import {Header} from '../services';
import {ActivatedRepository} from '../services/activated-repository';
import {ItemType} from '../services/dao';
import {Widget} from '../services/dao/dashboards-dao';
import {QueriesDao, Query} from '../services/dao/queries-dao';
import {RecommendationsDao} from '../services/dao/recommendations-dao';
import {QueryDialog} from '../shared/dialog/query/query-dialog';


@Component({
  styleUrls: ['query-page.scss'],
  templateUrl: 'query-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'[class.is-mobile]': 'isMobile()'}
})
export class QueryPage {
  isMobile = isMobile;

  set query(query: Query) {
    // When a query is set, the options state should be updated to be
    // whatever the query is, and the title should always match
    this._query = query;
    this.currentOptions = this.query.options;
    this.header.title.next(this.query.name);
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
    this.canSave = this.query && this.query.options && this.currentOptions &&
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

  @ViewChild(CdkPortal) toolbarActions: CdkPortal;

  constructor(
      private router: Router, private activatedRoute: ActivatedRoute,
      private recommendationsDao: RecommendationsDao,
      private activatedRepository: ActivatedRepository, private header: Header,
      private queriesDao: QueriesDao, private queryDialog: QueryDialog,
      private cd: ChangeDetectorRef) {
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
          this.createNewQueryFromRecommendation(recommendationId);
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
            this.queriesDao.map.pipe(takeUntil(this.destroyed), filter(map => !!map))
                .subscribe(map => {
                  if (map.get(id)) {
                    this.query = map.get(id);
                  } else {
                    this.router.navigate([`${this.activatedRepository.repository.value}/queries`]);
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
    this.queryDialog.saveAsQuery(
        this.currentOptions, this.activatedRepository.repository.value, this.query.type);
  }

  save() {
    this.queriesDao.update({id: this.query.id, options: this.currentOptions});
  }

  setBack(fromDashboard?: string) {
    if (fromDashboard) {
      this.header.goBack = () => this.router.navigate(
          [`/${this.activatedRepository.repository.value}/dashboard/${fromDashboard}`]);
    } else {
      this.header.goBack = () => this.router.navigate(
          [`/${this.activatedRepository.repository.value}/queries/${this.query.type}`]);
    }
  }

  private createNewQueryFromRecommendation(id: string) {
    this.recommendationsDao.list.pipe(filter(list => !!list), take(1)).subscribe(list => {
      list.forEach(r => {
        if (r.id === id) {
          const options = new ItemRendererOptions();
          options.filters = r.filters;
          options.search = r.search;
          this.query = createNewQuery('issue', r.message, options.getState());
          this.cd.markForCheck();
        }
      });
    });
  }
}

function createNewQuery(
    type: ItemType, name = 'New Query', optionsState: ItemRendererOptionsState = null): Query {
  const options = new ItemRendererOptions();

  if (optionsState) {
    options.setState(optionsState);
  }

  return {name, type, options: options.getState()};
}
