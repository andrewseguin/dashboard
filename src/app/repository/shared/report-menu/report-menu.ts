import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Report} from 'app/repository/services/dao/reports-dao';
import {IssueRendererOptionsState} from 'app/repository/services/issues-renderer/issue-renderer-options';
import {ReportDialog} from '../dialog/report/report-dialog';

@Component({
  selector: 'report-menu',
  templateUrl: 'report-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportMenu {
  @Input() report: Report;

  @Input() icon: 'settings'|'more_vert';

  @Input() optionsOverride: IssueRendererOptionsState;

  constructor(private reportDialog: ReportDialog) {}
  openEditNameDialog() {
    this.reportDialog.editReport(this.report);
  }

  deleteReport() {
    this.reportDialog.deleteReport(this.report);
  }
}
