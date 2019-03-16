import {Injectable} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ActiveRepo} from 'app/repository/services/active-repo';
import {Dao} from 'app/repository/services/dao/dao';
import {Dashboard} from 'app/repository/services/dao/dashboard';
import {of} from 'rxjs';
import {take} from 'rxjs/operators';
import {DeleteConfirmation} from '../delete-confirmation/delete-confirmation';
import {DashboardEdit} from './dashboard-edit/dashboard-edit';


@Injectable()
export class DashboardDialog {
  constructor(
      private dialog: MatDialog, private snackbar: MatSnackBar, private activeRepo: ActiveRepo,
      private dao: Dao) {}

  editDashboard(dashboard: Dashboard) {
    const data = {
      name: dashboard.name,
      description: dashboard.description,
    };
    const store = this.dao.get(this.activeRepo.repository);

    this.dialog.open(DashboardEdit, {data}).afterClosed().pipe(take(1)).subscribe(result => {
      if (result) {
        store.dashboards.update({id: dashboard.id, ...result});
      }
    });
  }

  /**
   * Shows delete query dialog. If user confirms deletion, remove the
   * query and navigate to the queries page.
   */
  removeDashboard(dashboard: Dashboard) {
    const data = {name: of(dashboard.name)};
    const store = this.dao.get(this.activeRepo.repository);

    this.dialog.open(DeleteConfirmation, {data})
        .afterClosed()
        .pipe(take(1))
        .subscribe(confirmed => {
          if (confirmed) {
            store.dashboards.remove(dashboard.id!);
            this.snackbar.open(`Dashboard "${dashboard.name}" deleted`, '', {duration: 2000});
          }
        });
  }
}
