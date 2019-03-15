import {Injectable} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {
  DeleteConfirmation
} from 'app/repository/shared/dialog/delete-confirmation/delete-confirmation';
import {LoadedRepos} from 'app/service/loaded-repos';
import {of} from 'rxjs';
import {filter, take} from 'rxjs/operators';
import {ActivatedRepository} from './activated-repository';
import {Dao} from './dao/dao';
import {RepoDaoType} from './repo-load-state';

@Injectable()
export class Remover {
  constructor(
      private loadedRepos: LoadedRepos, private dialog: MatDialog,
      private activatedRepository: ActivatedRepository, private snackbar: MatSnackBar,
      private dao: Dao) {}

  removeData(type: RepoDaoType) {
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
                  this.dao.labels.removeAll();
                  break;
                case 'items':
                  this.dao.items.removeAll();
                  break;
                case 'contributors':
                  this.dao.contributors.removeAll();
                  break;
              }

              this.snackbar.open(`Successfully deleted ${type}`, '', {duration: 2000});
            }
          });
    });
  }

  removeAllData(showConfirmationDialog = true, includeConfig = true) {
    this.activatedRepository.repository.pipe(filter(v => !!v), take(1)).subscribe(repository => {
      if (!showConfirmationDialog) {
        this.remove(repository!, includeConfig);
        return;
      }

      const name = `locally stored data for ${repository}`;
      const data = {name: of(name)};
      this.dialog.open(DeleteConfirmation, {data})
          .afterClosed()
          .pipe(take(1))
          .subscribe(confirmed => {
            if (confirmed) {
              this.remove(repository!, includeConfig);
              this.snackbar.open(`${name} deleted`, '', {duration: 2000});
            }
          });
    });
  }

  private remove(repository: string, includeConfig: boolean) {
    [this.dao.contributors, this.dao.items, this.dao.labels].forEach(dao => dao.removeAll());
    this.loadedRepos.removeLoadedRepo(repository!);

    if (includeConfig) {
      [this.dao.dashboards, this.dao.queries, this.dao.recommendations].forEach(
          dao => dao.removeAll());
    }
  }
}
