import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {IssueQuery} from 'app/repository/services/dao/issue-queries-dao';
import {IssueRendererOptionsState} from 'app/repository/services/issues-renderer/issue-renderer-options';
import {IssueQueryDialog} from '../dialog/issue-query/issue-query-dialog';

@Component({
  selector: 'issue-query-menu',
  templateUrl: 'issue-query-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueQueryMenu {
  @Input() issueQuery: IssueQuery;

  @Input() icon: 'settings'|'more_vert';

  @Input() optionsOverride: IssueRendererOptionsState;

  constructor(private issueQueryDialog: IssueQueryDialog) {}
  openEditNameDialog() {
    this.issueQueryDialog.editIssueQuery(this.issueQuery);
  }

  deleteIssueQuery() {
    this.issueQueryDialog.deleteIssueQuery(this.issueQuery);
  }
}
