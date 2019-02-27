import {ChangeDetectionStrategy, Component} from '@angular/core';
import {IssuesDao} from 'app/service/issues-dao';


@Component({
  styleUrls: ['home-page.scss'],
  templateUrl: 'home-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage {
  constructor(public issuesDao: IssuesDao) {}
}
