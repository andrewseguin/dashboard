import {Injectable} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {
  IssueQueriesDao,
  IssueQuery,
  IssueQueryType
} from 'app/repository/services/dao/issue-queries-dao';
import {
  IssueRendererOptionsState
} from 'app/repository/services/issues-renderer/issue-renderer-options';
import {of} from 'rxjs';
import {take} from 'rxjs/operators';
import {DeleteConfirmation} from '../delete-confirmation/delete-confirmation';
import {IssueQueryEdit} from './issue-query-edit/issue-query-edit';


@Injectable()
export class IssueQueryDialog {
  constructor(
      private dialog: MatDialog, private snackbar: MatSnackBar, private router: Router,
      private issueQueriesDao: IssueQueriesDao) {}

  /** Shows the edit issue query dialog to change the name/group.*/
  editIssueQuery(issueQuery: IssueQuery) {
    const data = {
      name: issueQuery.name,
      group: issueQuery.group,
    };

    this.dialog.open(IssueQueryEdit, {data}).afterClosed().pipe(take(1)).subscribe(result => {
      if (result) {
        this.issueQueriesDao.update(issueQuery.id, {name: result['name'], group: result['group']});
      }
    });
  }

  /**
   * Shows delete issue query dialog. If user confirms deletion, remove the
   * issue query and navigate to the issue queries page.
   */
  deleteIssueQuery(issueQuery: IssueQuery) {
    const data = {name: of(issueQuery.name)};

    this.dialog.open(DeleteConfirmation, {data})
        .afterClosed()
        .pipe(take(1))
        .subscribe(confirmed => {
          if (confirmed) {
            this.issueQueriesDao.remove(issueQuery.id);
            this.snackbar.open(`Issue query "${issueQuery.name}" deleted`, null, {duration: 2000});
          }
        });
  }

  /**
   * Shows edit issue query dialog to enter the name/group. If user enters a
   * name, save the issue query and automatically navigate to the issue query
   * page with $key, replacing the current URL.
   */
  saveAsIssueQuery(
      currentOptions: IssueRendererOptionsState, repository: string, type: IssueQueryType) {
    this.dialog.open(IssueQueryEdit).afterClosed().pipe(take(1)).subscribe(result => {
      if (!result) {
        return;
      }

      const issueQuery: IssueQuery =
          {name: result['name'], group: result['group'], options: currentOptions, type};

      this.issueQueriesDao.add(issueQuery).then(id => {
        this.router.navigate(
            [`${repository}/issue-query/${id}`], {replaceUrl: true, queryParamsHandling: 'merge'});
      });
    });
  }
}
