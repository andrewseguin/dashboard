import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RepoDao} from 'app/service/repo-dao';


@Component({
  styleUrls: ['reports-page.scss'],
  templateUrl: 'reports-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage {
  constructor(public repoDao: RepoDao) {}
}
