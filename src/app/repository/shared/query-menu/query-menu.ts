import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ItemRendererOptionsState} from 'app/package/items-renderer/item-renderer-options';
import {ActiveRepo} from 'app/repository/services/active-repo';
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

  constructor(private queryDialog: QueryDialog, private activeRepo: ActiveRepo) {}

  openEditNameDialog() {
    this.queryDialog.editQuery(this.query, this.activeRepo.activeStore);
  }

  deleteQuery() {
    this.queryDialog.deleteQuery(this.query, this.activeRepo.activeStore);
  }
}
