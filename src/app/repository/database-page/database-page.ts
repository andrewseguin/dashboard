import {ChangeDetectionStrategy, Component} from '@angular/core';
import {filter, map} from 'rxjs/operators';
import {ActiveRepo} from '../services/active-repo';
import {Dao} from '../services/dao/dao';
import {Remover} from '../services/remover';
import {RepoLoadState} from '../services/repo-load-state';


@Component({
  selector: 'database-page',
  styleUrls: ['database-page.scss'],
  templateUrl: 'database-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatabasePage {
  repoLabels = this.dao.labels.list.pipe(filter(v => !!v), map(labels => labels!.map(l => l.id)));

  constructor(
      public activeRepo: ActiveRepo, public dao: Dao, public repoLoadState: RepoLoadState,
      public remover: Remover) {}
}
