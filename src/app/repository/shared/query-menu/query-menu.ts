import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Query} from 'app/repository/services/dao/queries-dao';
import {
  ItemRendererOptionsState
} from 'app/repository/services/items-renderer/item-renderer-options';
import {QueryDialog} from '../dialog/issue-query/issue-query-dialog';

@Component({
  selector: 'query-menu',
  templateUrl: 'query-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueryMenu {
  @Input() query: Query;

  @Input() icon: 'settings'|'more_vert';

  @Input() optionsOverride: ItemRendererOptionsState;

  constructor(private queryDialog: QueryDialog) {}

  openEditNameDialog() {
    this.queryDialog.editQuery(this.query);
  }

  deleteQuery() {
    this.queryDialog.deleteQuery(this.query);
  }
}
