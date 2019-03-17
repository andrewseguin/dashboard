import {Injectable} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {
  DeleteConfirmation
} from 'app/repository/shared/dialog/delete-confirmation/delete-confirmation';
import {LoadedRepos} from 'app/service/loaded-repos';
import {of} from 'rxjs';
import {filter, take} from 'rxjs/operators';
import {ActiveRepo} from './active-repo';
import {Dao, RepoDaoType} from './dao/dao';

@Injectable()
export class Remover {
  constructor(
      private loadedRepos: LoadedRepos, private dialog: MatDialog, private activeRepo: ActiveRepo,
      private snackbar: MatSnackBar, private dao: Dao) {}

  removeData(type: RepoDaoType) {
    const repository = this.activeRepo.activeRepository;
    this.dialog.open(DeleteConfirmation, {data: {name: of(`${type} data for ${repository}`)}})
        .afterClosed()
        .pipe(take(1))
        .subscribe(confirmed => {
          if (confirmed) {
            switch (type) {
              case 'labels':
                this.dao.get(repository).labels.removeAll();
                break;
              case 'items':
                this.dao.get(repository).items.removeAll();
                break;
              case 'contributors':
                this.dao.get(repository).contributors.removeAll();
                break;
            }

            this.snackbar.open(`Successfully deleted ${type}`, '', {duration: 2000});
          }
        });
  }

  removeAllData(showConfirmationDialog = true, includeConfig = true) {
    this.activeRepo.repository.pipe(filter(v => !!v), take(1)).subscribe(repository => {
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
    const store = this.dao.get(repository);
    [store.contributors, store.items, store.labels].forEach(dao => dao.removeAll());
    this.loadedRepos.removeLoadedRepo(repository!);

    if (includeConfig) {
      [store.dashboards, store.queries, store.recommendations].forEach(dao => dao.removeAll());
    }
  }
}
