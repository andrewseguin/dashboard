import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {BehaviorSubject, of} from 'rxjs';
import {filter, map, take} from 'rxjs/operators';
import {ActivatedRepository} from '../services/activated-repository';
import {LabelsDao} from '../services/dao';
import {RepoDao} from '../services/dao/repo-dao';
import {RepoIndexedDb} from '../services/repo-indexed-db';
import {Updater} from '../services/updater';
import {DeleteConfirmation} from '../shared/dialog/delete-confirmation/delete-confirmation';
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
      private activatedRepository: ActivatedRepository, private repoIndexedDb: RepoIndexedDb,
      public repoDao: RepoDao, private labelsDao: LabelsDao, private updater: Updater,
      private dialog: MatDialog, private snackbar: MatSnackBar) {}

  removeData() {
    const repository = this.activatedRepository.repository.value;
    const name = `locally stored data for ${repository}`;
    const data = {name: of(name)};

    this.dialog.open(DeleteConfirmation, {data})
        .afterClosed()
        .pipe(take(1))
        .subscribe(confirmed => {
          if (confirmed) {
            this.repoIndexedDb.removeData();
            this.snackbar.open(`${name} deleted`, null, {duration: 2000});
          }
        });
  }

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
