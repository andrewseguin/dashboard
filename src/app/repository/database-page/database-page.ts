import {ChangeDetectionStrategy, Component} from '@angular/core';
import {filter, map} from 'rxjs/operators';
import {ActivatedRepository} from '../services/activated-repository';
import {ContributorsDao, ItemsDao, LabelsDao} from '../services/dao';
import {Remover} from '../services/remover';
import {RepoLoadState} from '../services/repo-load-state';


@Component({
  selector: 'database-page',
  styleUrls: ['database-page.scss'],
  templateUrl: 'database-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatabasePage {
  repoLabels = this.labelsDao.list.pipe(filter(v => !!v), map(labels => labels!.map(l => l.id)));

  constructor(
      public activatedRepository: ActivatedRepository, public contributorsDao: ContributorsDao,
      public labelsDao: LabelsDao, public repoLoadState: RepoLoadState, public itemsDao: ItemsDao,
      public remover: Remover) {}
}
