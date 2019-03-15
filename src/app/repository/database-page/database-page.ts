import {ChangeDetectionStrategy, Component} from '@angular/core';
import {filter, map} from 'rxjs/operators';
import {ActivatedRepository} from '../services/activated-repository';
import {Remover} from '../services/remover';
import {RepoLoadState} from '../services/repo-load-state';
import { Dao } from '../services/dao/dao';


@Component({
  selector: 'database-page',
  styleUrls: ['database-page.scss'],
  templateUrl: 'database-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatabasePage {
  repoLabels = this.dao.labels.list.pipe(filter(v => !!v), map(labels => labels!.map(l => l.id)));

  constructor(
      public activatedRepository: ActivatedRepository, public dao: Dao,
      public repoLoadState: RepoLoadState, public remover: Remover) {}
}
