import {Injectable} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {Dashboard, DashboardsDao} from 'app/repository/services/dao/dashboards-dao';
import {of} from 'rxjs';
import {take} from 'rxjs/operators';
import {DeleteConfirmation} from '../delete-confirmation/delete-confirmation';
import {DashboardEdit} from './dashboard-edit/dashboard-edit';


@Injectable()
export class DashboardDialog {
  constructor(
      private dialog: MatDialog, private snackbar: MatSnackBar, private router: Router,
      private dashboardsDao: DashboardsDao) {}

  editDashboard(dashboard: Dashboard) {
    const data = {
      name: dashboard.name,
      description: dashboard.description,
    };

    this.dialog.open(DashboardEdit, {data}).afterClosed().pipe(take(1)).subscribe(result => {
      if (result) {
        this.dashboardsDao.update(
            {id: dashboard.id, name: result['name'], description: result['description']});
      }
    });
  }

  /**
   * Shows delete query dialog. If user confirms deletion, remove the
   * query and navigate to the queries page.
   */
  removeDashboard(dashboard: Dashboard) {
    const data = {name: of(dashboard.name)};

    this.dialog.open(DeleteConfirmation, {data})
        .afterClosed()
        .pipe(take(1))
        .subscribe(confirmed => {
          if (confirmed) {
            this.dashboardsDao.remove(dashboard.id);
            this.snackbar.open(`Dashboard "${dashboard.name}" deleted`, null, {duration: 2000});
          }
        });
  }
}
