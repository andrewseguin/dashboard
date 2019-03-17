import {Injectable} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {
  DeleteConfirmation
} from 'app/repository/shared/dialog/delete-confirmation/delete-confirmation';
import {LoadedRepos} from 'app/service/loaded-repos';
import {of} from 'rxjs';
import {take} from 'rxjs/operators';
import {RepoDaoType, RepoStore} from './dao/dao';

@Injectable()
export class Remover {
  constructor(
      private loadedRepos: LoadedRepos, private dialog: MatDialog, private snackbar: MatSnackBar) {}

  removeData(store: RepoStore, type: RepoDaoType) {
    this.dialog.open(DeleteConfirmation, {data: {name: of(`${type} data for ${store.repository}`)}})
        .afterClosed()
        .pipe(take(1))
        .subscribe(confirmed => {
          if (confirmed) {
            switch (type) {
              case 'labels':
                store.labels.removeAll();
                break;
              case 'items':
                store.items.removeAll();
                break;
              case 'contributors':
                store.contributors.removeAll();
                break;
            }

            this.snackbar.open(`Successfully deleted ${type}`, '', {duration: 2000});
          }
        });
  }

  removeAllData(store: RepoStore, showConfirmationDialog = true, includeConfig = true) {
    if (!showConfirmationDialog) {
      this.remove(store, includeConfig);
      return;
    }

    const name = `locally stored data for ${store.repository}`;
    const data = {name: of(name)};
    this.dialog.open(DeleteConfirmation, {data})
        .afterClosed()
        .pipe(take(1))
        .subscribe(confirmed => {
          if (confirmed) {
            this.remove(store, includeConfig);
            this.snackbar.open(`${name} deleted`, '', {duration: 2000});
          }
        });
  }

  private remove(store: RepoStore, includeConfig: boolean) {
    [store.contributors, store.items, store.labels].forEach(dao => dao.removeAll());
    this.loadedRepos.removeLoadedRepo(store.repository!);

    if (includeConfig) {
      [store.dashboards, store.queries, store.recommendations].forEach(dao => dao.removeAll());
    }
  }
}
