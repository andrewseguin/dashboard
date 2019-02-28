import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RepoDao} from 'app/service/repo-dao';


@Component({
  styleUrls: ['home-page.scss'],
  templateUrl: 'home-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage {
  repo = 'angular/material2';

  constructor(public issuesDao: RepoDao) {}
}
