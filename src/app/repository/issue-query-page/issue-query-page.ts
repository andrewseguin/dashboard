import {CdkPortal} from '@angular/cdk/portal';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {isMobile} from 'app/utility/media-matcher';
import {Subject, Subscription} from 'rxjs';
import {filter, map, take, takeUntil} from 'rxjs/operators';

import {Header} from '../services';
import {ActivatedRepository} from '../services/activated-repository';
import {Widget} from '../services/dao/dashboards-dao';
import {IssueQueriesDao, IssueQuery, IssueQueryType} from '../services/dao/issue-queries-dao';
import {RecommendationsDao} from '../services/dao/recommendations-dao';
import {
  areOptionStatesEqual,
  IssueRendererOptions,
  IssueRendererOptionsState
} from '../services/issues-renderer/issue-renderer-options';
import {IssueQueryDialog} from '../shared/dialog/issue-query/issue-query-dialog';
import {Filter} from '../utility/search/filter';

@Component({
  styleUrls: ['issue-query-page.scss'],
  templateUrl: 'issue-query-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'[class.is-mobile]': 'isMobile()'}
})
export class IssueQueryPage {
  isMobile = isMobile;

  set issueQuery(issueQuery: IssueQuery) {
    // When a issue query is set, the options state should be updated to be
    // whatever the issue query is, and the title should always match
    this._issueQuery = issueQuery;
    this.currentOptions = this.issueQuery.options;
    this.header.title.next(this.issueQuery.name);
    this.header.goBack = () => this.router.navigate(
        [`/${this.activatedRepository.repository.value}/issue-queries/${this.issueQuery.type}`]);
  }
  get issueQuery(): IssueQuery {
    return this._issueQuery;
  }
  private _issueQuery: IssueQuery;

  set currentOptions(currentOptions: IssueRendererOptionsState) {
    // When current options change, a check should be evaluated if they differ
    // from the current issue query's options. If so, the save button should
    // display.
    this._currentOptions = currentOptions;
    this.canSave = this.issueQuery && this.issueQuery.options && this.currentOptions &&
        !areOptionStatesEqual(this.issueQuery.options, this.currentOptions);
  }
  get currentOptions(): IssueRendererOptionsState {
    return this._currentOptions;
  }
  private _currentOptions: IssueRendererOptionsState;

  canSave: boolean;

  issueId =
      this.activatedRoute.queryParamMap.pipe(map(queryParamsMap => +queryParamsMap.get('issue')));

  private destroyed = new Subject();
  private getSubscription: Subscription;

  @ViewChild(CdkPortal) toolbarActions: CdkPortal;

  constructor(
      private router: Router, private activatedRoute: ActivatedRoute,
      private recommendationsDao: RecommendationsDao,
      private activatedRepository: ActivatedRepository, private header: Header,
      private issueQueriesDao: IssueQueriesDao, private issueQueryDialog: IssueQueryDialog,
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

        if (recommendationId) {
          this.createNewIssueQueryFromRecommendation(recommendationId);
        } else if (widgetJson) {
          const widget: Widget = JSON.parse(widgetJson);
          this.issueQuery = createNewIssueQuery('issue', widget.title, widget.options);
        } else {
          const type = queryParamMap.get('type') as IssueQueryType;
          this.issueQuery = createNewIssueQuery(type);
        }
        this.cd.markForCheck();
      } else {
        this.getSubscription =
            this.issueQueriesDao.map.pipe(takeUntil(this.destroyed), filter(map => !!map))
                .subscribe(map => {
                  if (map.get(id)) {
                    this.issueQuery = map.get(id);
                  } else {
                    this.router.navigate(
                        [`${this.activatedRepository.repository.value}/issue-queries`]);
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
    this.issueQueryDialog.saveAsIssueQuery(
        this.currentOptions, this.activatedRepository.repository.value, this.issueQuery.type);
  }

  save() {
    this.issueQueriesDao.update(this.issueQuery.id, {options: this.currentOptions});
  }

  private createNewIssueQueryFromRecommendation(id: string) {
    this.recommendationsDao.list.pipe(filter(list => !!list), take(1)).subscribe(list => {
      list.forEach(r => {
        if (r.id === id) {
          const options = new IssueRendererOptions();
          options.filters = r.filters;
          options.search = r.search;
          this.issueQuery = createNewIssueQuery('issue', r.message, options.getState());
          this.cd.markForCheck();
        }
      });
    });
  }
}

function createNewIssueQuery(
    type: IssueQueryType, name = 'New Issue Query',
    optionsState: IssueRendererOptionsState = null): IssueQuery {
  const options = new IssueRendererOptions();

  if (optionsState) {
    options.setState(optionsState);
  }

  return {name, type, options: options.getState()};
}
