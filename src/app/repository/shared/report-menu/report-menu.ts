import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Router} from '@angular/router';
import {Report} from 'app/repository/issues-page/issues-page';
import {RequestRendererOptionsState} from 'app/repository/services/requests-renderer/request-renderer-options';

@Component({
  selector: 'report-menu',
  templateUrl: 'report-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportMenu {
  @Input() report: Report;

  @Input() icon: 'settings'|'more_vert';

  @Input() optionsOverride: RequestRendererOptionsState;

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
