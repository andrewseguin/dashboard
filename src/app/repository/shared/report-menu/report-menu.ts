import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Router} from '@angular/router';
import {Report} from 'app/repository/issues-page/issues-page';
import {IssueRendererOptionsState} from 'app/repository/services/issues-renderer/issue-renderer-options';

@Component({
  selector: 'report-menu',
  templateUrl: 'report-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportMenu {
  @Input() report: Report;

  @Input() icon: 'settings'|'more_vert';

  @Input() optionsOverride: IssueRendererOptionsState;

  constructor(  // private reportDialog: ReportDialog,
                //   private activatedSeason: ActivatedSeason,
      private router: Router) {}
  openEditNameDialog() {
    // this.reportDialog.editReport(this.report);
  }

  deleteReport() {
    // this.reportDialog.deleteReport(this.report);
  }
}
