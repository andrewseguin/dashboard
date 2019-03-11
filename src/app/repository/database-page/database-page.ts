import {ChangeDetectionStrategy, Component} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {filter, map} from 'rxjs/operators';

import {ActivatedRepository} from '../services/activated-repository';
import {ItemsDao, LabelsDao} from '../services/dao';
import {DaoState} from '../services/dao/dao-state';
import {Remover} from '../services/remover';
import {Updater} from '../services/updater';

import {UpdateState} from './update-button/update-button';


@Component({
  selector: 'database-page',
  styleUrls: ['database-page.scss'],
  templateUrl: 'database-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatabasePage {
  repoLabels =
      this.labelsDao.list.pipe(filter(list => !!list), map(labels => labels.map(l => l.id)));

  issuesUpdateState = new BehaviorSubject<UpdateState>('not-updating');
  labelsUpdateState = new BehaviorSubject<UpdateState>('not-updating');

  constructor(
      public daoState: DaoState, public activatedRepository: ActivatedRepository,
      public labelsDao: LabelsDao, public itemsDao: ItemsDao, private updater: Updater,
      public remover: Remover) {}

  updateLabels() {
    this.labelsUpdateState.next('updating');
    this.updater.updateLabels(this.activatedRepository.repository.value).then(() => {
      this.labelsUpdateState.next('updated');
    });
  }

  updateIssues() {
    this.issuesUpdateState.next('updating');
    this.updater.updateIssues(this.activatedRepository.repository.value).then(() => {
      this.issuesUpdateState.next('updated');
    });
  }
}
