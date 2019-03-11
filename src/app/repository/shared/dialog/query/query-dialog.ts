import {Injectable} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {ItemRendererOptionsState} from 'app/package/items-renderer/item-renderer-options';
import {ItemType} from 'app/repository/services/dao';
import {QueriesDao, Query} from 'app/repository/services/dao/queries-dao';
import {of} from 'rxjs';
import {take} from 'rxjs/operators';
import {DeleteConfirmation} from '../delete-confirmation/delete-confirmation';
import {QueryEdit} from './query-edit/query-edit';


@Injectable()
export class QueryDialog {
  constructor(
      private dialog: MatDialog, private snackbar: MatSnackBar, private router: Router,
      private queriesDao: QueriesDao) {}

  /** Shows the edit query dialog to change the name/group.*/
  editQuery(query: Query) {
    const data = {
      name: query.name,
      group: query.group,
    };

    this.dialog.open(QueryEdit, {data}).afterClosed().pipe(take(1)).subscribe(result => {
      if (result) {
        this.queriesDao.update({id: query.id, name: result['name'], group: result['group']});
      }
    });
  }

  /**
   * Shows delete query dialog. If user confirms deletion, remove the
   * query and navigate to the queries page.
   */
  deleteQuery(query: Query) {
    const data = {name: of(query.name)};

    this.dialog.open(DeleteConfirmation, {data})
        .afterClosed()
        .pipe(take(1))
        .subscribe(confirmed => {
          if (confirmed) {
            this.queriesDao.remove(query.id);
            this.snackbar.open(`Query "${query.name}" deleted`, null, {duration: 2000});
          }
        });
  }

  /**
   * Shows edit query dialog to enter the name/group. If user enters a
   * name, save the query and automatically navigate to the query
   * page with $key, replacing the current URL.
   */
  saveAsQuery(currentOptions: ItemRendererOptionsState, repository: string, type: ItemType) {
    this.dialog.open(QueryEdit).afterClosed().pipe(take(1)).subscribe(result => {
      if (!result) {
        return;
      }

      const query:
          Query = {name: result['name'], group: result['group'], options: currentOptions, type};

      const newQueryId = this.queriesDao.add(query);
      this.router.navigate(
          [`${repository}/query/${newQueryId}`], {replaceUrl: true, queryParamsHandling: 'merge'});
    });
  }
}
