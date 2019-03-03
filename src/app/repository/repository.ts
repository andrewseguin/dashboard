import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatDialog} from '@angular/material';
import {RepoDao} from 'app/service/repo-dao';
import {interval, Subject} from 'rxjs';
import {Updater} from './services/updater';
import {CreateStore} from './shared/dialog/create-store/create-store';
import {takeUntil} from 'rxjs/operators';

@Component({
  templateUrl: 'repository.html',
  styleUrls: ['repository.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Repository {
  repo = 'angular/material2';

  constructor(public repoStoreDao: RepoDao, private dialog: MatDialog, private updater: Updater) {
    this.repoStoreDao.initialize(this.repo);

    const checked = new Subject();
    this.repoStoreDao.repo.pipe(takeUntil(checked)).subscribe(result => {
      if (!result) {
        return;
      }

      checked.next();
      checked.complete();

      if (result.empty) {
        this.requestCreateStore();
      } else {
        this.initializeAutoUpdates();
      }
    });
  }

  private initializeAutoUpdates() {
    interval(20 * 1000).subscribe(() => {
      console.log('updating');
      this.updater.updateLabels(this.repo);
      this.updater.updateContributors(this.repo);
      this.updater.updateIssues(this.repo);
    });
  }

  private requestCreateStore() {
    const config = {
      data: {repo: this.repo},
      width: '500px'
    };
    this.dialog.open(CreateStore, config).afterClosed().subscribe(created => {
      if (created) {
        this.initializeAutoUpdates();
      }
    });
  }
}
