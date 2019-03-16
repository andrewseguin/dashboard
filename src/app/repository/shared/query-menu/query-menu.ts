import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ItemRendererOptionsState} from 'app/package/items-renderer/item-renderer-options';
import {Query} from 'app/repository/services/dao/query';
import {QueryDialog} from '../dialog/query/query-dialog';

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
