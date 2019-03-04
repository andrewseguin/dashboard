import {CdkPortal} from '@angular/cdk/portal';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject, Subscription} from 'rxjs';
import {filter, map, takeUntil} from 'rxjs/operators';

import {Header} from '../services';
import {ActivatedRepository} from '../services/activated-repository';
import {Report, ReportsDao} from '../services/dao/reports-dao';
import {areOptionStatesEqual, IssueRendererOptions, IssueRendererOptionsState} from '../services/issues-renderer/issue-renderer-options';
import {ReportDialog} from '../shared/dialog/report/report-dialog';

@Component({
  styleUrls: ['issue-query-page.scss'],
  templateUrl: 'issue-query-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueQueryPage {
  set report(report: Report) {
    // When a report is set, the options state should be updated to be
    // whatever the report is, and the title should always match
    this._report = report;
    this.currentOptions = this.report.options;
    this.header.title.next(this.report.name);
  }
  get report(): Report {
    return this._report;
  }
  private _report: Report;

  set currentOptions(currentOptions: IssueRendererOptionsState) {
    // When current options change, a check should be evaluated if they differ
    // from the current report's options. If so, the save button should display.
    this._currentOptions = currentOptions;
    this.canSave = this.report && this.report.options && this.currentOptions &&
        !areOptionStatesEqual(this.report.options, this.currentOptions);
  }
  get currentOptions(): IssueRendererOptionsState {
    return this._currentOptions;
  }
  private _currentOptions: IssueRendererOptionsState;

  canSave: boolean;

  issueId = this.activatedRoute.queryParamMap.pipe(
      map(queryParamsMap => +queryParamsMap.get('issue')));

  private destroyed = new Subject();
  private reportGetSubscription: Subscription;

  @ViewChild(CdkPortal) toolbarActions: CdkPortal;

  constructor(
      private router: Router, private activatedRoute: ActivatedRoute,
      private activatedRepository: ActivatedRepository, private header: Header,
      private reportsDao: ReportsDao, private reportDialog: ReportDialog,
      private cd: ChangeDetectorRef) {
    this.activatedRoute.params.pipe(takeUntil(this.destroyed))
        .subscribe(params => {
          const id = params['id'];
          this.canSave = false;

          if (this.reportGetSubscription) {
            this.reportGetSubscription.unsubscribe();
          }

          if (id === 'new') {
            this.report = createNewReport();
            this.cd.markForCheck();
          } else {
            this.reportGetSubscription =
                this.reportsDao.map
                    .pipe(takeUntil(this.destroyed), filter(map => !!map))
                    .subscribe(map => {
                      if (map.get(id)) {
                        this.report = map.get(id);
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
    this.reportDialog.saveAsReport(
        this.currentOptions, this.activatedRepository.repository.value);
  }

  save() {
    this.reportsDao.update(this.report.id, {options: this.currentOptions});
  }
}

function createNewReport() {
  const options = new IssueRendererOptions();
  return {name: 'New Report', options: options.getState()};
}
