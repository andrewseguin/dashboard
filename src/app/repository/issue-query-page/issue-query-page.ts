import {CdkPortal} from '@angular/cdk/portal';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject, Subscription} from 'rxjs';
import {filter, map, takeUntil} from 'rxjs/operators';

import {Header} from '../services';
import {ActivatedRepository} from '../services/activated-repository';
import {IssueQuery, IssueQueriesDao} from '../services/dao/issue-queries-dao';
import {areOptionStatesEqual, IssueRendererOptions, IssueRendererOptionsState} from '../services/issues-renderer/issue-renderer-options';
import {IssueQueryDialog} from '../shared/dialog/issue-query/issue-query-dialog';

@Component({
  styleUrls: ['issue-query-page.scss'],
  templateUrl: 'issue-query-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueQueryPage {
  set issueQuery(issueQuery: IssueQuery) {
    // When a issue query is set, the options state should be updated to be
    // whatever the issue query is, and the title should always match
    this._issueQuery = issueQuery;
    this.currentOptions = this.issueQuery.options;
    this.header.title.next(this.issueQuery.name);
  }
  get issueQuery(): IssueQuery {
    return this._issueQuery;
  }
  private _issueQuery: IssueQuery;

  set currentOptions(currentOptions: IssueRendererOptionsState) {
    // When current options change, a check should be evaluated if they differ
    // from the current issue query's options. If so, the save button should display.
    this._currentOptions = currentOptions;
    this.canSave = this.issueQuery && this.issueQuery.options && this.currentOptions &&
        !areOptionStatesEqual(this.issueQuery.options, this.currentOptions);
  }
  get currentOptions(): IssueRendererOptionsState {
    return this._currentOptions;
  }
  private _currentOptions: IssueRendererOptionsState;

  canSave: boolean;

  issueId = this.activatedRoute.queryParamMap.pipe(
      map(queryParamsMap => +queryParamsMap.get('issue')));

  private destroyed = new Subject();
  private getSubscription: Subscription;

  @ViewChild(CdkPortal) toolbarActions: CdkPortal;

  constructor(
      private router: Router, private activatedRoute: ActivatedRoute,
      private activatedRepository: ActivatedRepository, private header: Header,
      private issueQueriesDao: IssueQueriesDao, private issueQueryDialog: IssueQueryDialog,
      private cd: ChangeDetectorRef) {
    this.activatedRoute.params.pipe(takeUntil(this.destroyed))
        .subscribe(params => {
          const id = params['id'];
          this.canSave = false;

          if (this.getSubscription) {
            this.getSubscription.unsubscribe();
          }

          if (id === 'new') {
            this.issueQuery = createNewIssueQuery();
            this.cd.markForCheck();
          } else {
            this.getSubscription =
                this.issueQueriesDao.map
                    .pipe(takeUntil(this.destroyed), filter(map => !!map))
                    .subscribe(map => {
                      if (map.get(id)) {
                        this.issueQuery = map.get(id);
                      } else {
                        this.router.navigate([`${
                            this.activatedRepository.repository
                                .value}/issue-queries`]);
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
        this.currentOptions, this.activatedRepository.repository.value);
  }

  save() {
    this.issueQueriesDao.update(this.issueQuery.id, {options: this.currentOptions});
  }
}

function createNewIssueQuery() {
  const options = new IssueRendererOptions();
  return {name: 'New Issue Query', options: options.getState()};
}
