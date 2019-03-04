import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RepoDao} from 'app/service/repo-dao';

@Component({
  selector: 'cache',
  styleUrls: ['cache.scss'],
  templateUrl: 'cache.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Cache {
  constructor(public repoDao: RepoDao) {}
}
