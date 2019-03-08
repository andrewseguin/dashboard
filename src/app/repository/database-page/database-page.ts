import {Component, ChangeDetectionStrategy} from '@angular/core';
import {RepoDao} from 'app/service/repo-dao';

import {ActivatedRepository} from '../services/activated-repository';

@Component({
  selector: 'database-page',
  styleUrls: ['database-page.scss'],
  templateUrl: 'database-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatabasePage {
  constructor(private activatedRepository: ActivatedRepository, private repoDao: RepoDao) {}
}
