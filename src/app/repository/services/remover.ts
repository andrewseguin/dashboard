import {Injectable} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {
  DeleteConfirmation
} from 'app/repository/shared/dialog/delete-confirmation/delete-confirmation';
import {of} from 'rxjs';
import {take} from 'rxjs/operators';
import {ActivatedRepository} from './activated-repository';
import {ContributorsDao} from './dao/contributors-dao';
import {DashboardsDao} from './dao/dashboards-dao';
import {ItemsDao} from './dao/items-dao';
import {LabelsDao} from './dao/labels-dao';
import {QueriesDao} from './dao/queries-dao';
import {RecommendationsDao} from './dao/recommendations-dao';

@Injectable()
export class Remover {
  constructor(
      private dialog: MatDialog, private activatedRepository: ActivatedRepository,
      private snackbar: MatSnackBar, private contributorsDao: ContributorsDao,
      private dashboardsDao: DashboardsDao, private itemsDao: ItemsDao,
      private labelsDao: LabelsDao, private queriesDao: QueriesDao,
      private recommendationsDao: RecommendationsDao) {}

  removeAllData() {
    const repository = this.activatedRepository.repository.value;
    const name = `locally stored data for ${repository}`;
    const data = {name: of(name)};

    this.dialog.open(DeleteConfirmation, {data})
        .afterClosed()
        .pipe(take(1))
        .subscribe(confirmed => {
          if (confirmed) {
            this.contributorsDao.removeAll();
            this.dashboardsDao.removeAll();
            this.itemsDao.removeAll();
            this.labelsDao.removeAll();
            this.queriesDao.removeAll();
            this.recommendationsDao.removeAll();

            this.snackbar.open(`${name} deleted`, null, {duration: 2000});
          }
        });
  }
}
