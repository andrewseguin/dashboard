import {ChangeDetectionStrategy, Component} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {ActivatedRepository} from '../services/activated-repository';
import {ContributorsDao, ItemsDao, LabelsDao} from '../services/dao';
import {Remover} from '../services/remover';
import {RepoLoadState} from '../services/repo-load-state';
import {Updater} from '../services/updater';
import {UpdateState} from './update-button/update-button';


@Component({
  selector: 'database-page',
  styleUrls: ['database-page.scss'],
  templateUrl: 'database-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatabasePage {
  repoLabels = this.labelsDao.list.pipe(filter(v => !!v), map(labels => labels!.map(l => l.id)));

  issuesUpdateState = new BehaviorSubject<UpdateState>('not-updating');
  labelsUpdateState = new BehaviorSubject<UpdateState>('not-updating');
  contributorsUpdateState = new BehaviorSubject<UpdateState>('not-updating');

  isLoaded = this.repoLoadState.isLoaded;

  constructor(
      public activatedRepository: ActivatedRepository, public contributorsDao: ContributorsDao,
      public labelsDao: LabelsDao, private repoLoadState: RepoLoadState, public itemsDao: ItemsDao,
      private updater: Updater, public remover: Remover) {}

  updateLabels() {
    this.labelsUpdateState.next('updating');
    this.updater.updateLabels().then(() => this.labelsUpdateState.next('updated'));
  }

  updateIssues() {
    this.issuesUpdateState.next('updating');
    this.updater.updateIssues().then(() => this.issuesUpdateState.next('updated'));
  }

  updateContributors() {
    this.contributorsUpdateState.next('updating');
    this.updater.updateContributors().then(() => this.contributorsUpdateState.next('updated'));
  }
}
