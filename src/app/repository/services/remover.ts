import {Injectable} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {
  DeleteConfirmation
} from 'app/repository/shared/dialog/delete-confirmation/delete-confirmation';
import {LoadedRepos} from 'app/service/loaded-repos';
import {of} from 'rxjs';
import {filter, take} from 'rxjs/operators';
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
      private loadedRepos: LoadedRepos, private dialog: MatDialog,
      private activatedRepository: ActivatedRepository, private snackbar: MatSnackBar,
      private contributorsDao: ContributorsDao, private dashboardsDao: DashboardsDao,
      private itemsDao: ItemsDao, private labelsDao: LabelsDao, private queriesDao: QueriesDao,
      private recommendationsDao: RecommendationsDao) {}

  removeData(type: 'labels'|'items'|'contributors') {
    this.activatedRepository.repository.pipe(filter(v => !!v), take(1)).subscribe(repository => {
      const name = `${type} data for ${repository}`;
      const data = {name: of(name)};

      this.dialog.open(DeleteConfirmation, {data})
          .afterClosed()
          .pipe(take(1))
          .subscribe(confirmed => {
            if (confirmed) {
              switch (type) {
                case 'labels':
                  this.labelsDao.removeAll();
                  break;
                case 'items':
                  this.itemsDao.removeAll();
                  break;
                case 'contributors':
                  this.contributorsDao.removeAll();
                  break;
              }

              this.snackbar.open(`Successfully deleted ${type}`, '', {duration: 2000});
            }
          });
    });
  }


  removeAllData(includeConfig = true) {
    this.activatedRepository.repository.pipe(filter(v => !!v), take(1)).subscribe(repository => {
      const name = `locally stored data for ${repository}`;
      const data = {name: of(name)};

      this.dialog.open(DeleteConfirmation, {data})
          .afterClosed()
          .pipe(take(1))
          .subscribe(confirmed => {
            if (confirmed) {
              this.contributorsDao.removeAll();
              this.itemsDao.removeAll();
              this.labelsDao.removeAll();
              this.loadedRepos.removeLoadedRepo(repository!);

              if (includeConfig) {
                this.dashboardsDao.removeAll();
                this.queriesDao.removeAll();
                this.recommendationsDao.removeAll();
              }

              this.snackbar.open(`${name} deleted`, '', {duration: 2000});
            }
          });
    });
  }
}
