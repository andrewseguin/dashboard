import {CdkPortal} from '@angular/cdk/portal';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {Header} from '../services';
import {areOptionStatesEqual, IssueRendererOptions, IssueRendererOptionsState} from '../services/issues-renderer/issue-renderer-options';

export interface Report {
  id?: string;
  name?: string;
  group?: string;
  createdBy?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
  season?: string;
  options?: IssueRendererOptionsState;
}

@Component({
  styleUrls: ['issues-page.scss'],
  templateUrl: 'issues-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssuesPage {
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

  issueId: number;

  private destroyed = new Subject();
  private reportGetSubscription: Subscription;

  @ViewChild(CdkPortal) toolbarActions: CdkPortal;

  constructor(
      private router: Router,
      private activatedRoute: ActivatedRoute,
      // private activatedSeason: ActivatedRepository,
      private header: Header,
      private snackbar: MatSnackBar,
      private cd: ChangeDetectorRef,
  ) {
    this.report = createNewReport();
    this.activatedRoute.queryParamMap.pipe(takeUntil(this.destroyed))
        .subscribe(params => {
          this.issueId = +params.get('issue');
        });



    /* this.activatedRoute.params.pipe(takeUntil(this.destroyed)).subscribe(params => {
      const id = params['id'];
      this.canSave = false;

      if (this.reportGetSubscription) {
        this.reportGetSubscription.unsubscribe();
      }

      if (id === 'new') {
        this.report = createNewReport();
        this.cd.markForCheck();
      } else {
        this.reportGetSubscription = this.reportsDao.get(id)
          .pipe(takeUntil(this.destroyed))
          .subscribe(report => {
            if (report) {
              this.report = report;
            } else {
              this.router.navigate([`reports`],
                  {relativeTo: this.activatedRoute.parent});
            }
            this.cd.markForCheck();
          });
      }
    });
 */  }

    ngOnInit() {
      this.header.toolbarOutlet.next(this.toolbarActions);
    }

    ngOnDestroy() {
      this.header.toolbarOutlet.next(null);
      this.destroyed.next();
      this.destroyed.complete();
    }

    saveAs() {
      // this.reportDialog.saveAsReport(
      //     this.currentOptions, this.activatedSeason.season.value);
    }

    save() {
      // this.reportsDao.update(this.report.id, {options: this.currentOptions});
    }
}

function createNewReport() {
  const options = new IssueRendererOptions();
  return {name: 'New Report', options: options.getState()};
}
