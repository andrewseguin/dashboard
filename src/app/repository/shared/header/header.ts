import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatSidenav} from '@angular/material';
import {Header} from 'app/repository/services/header';
import {RepoLoadState} from 'app/repository/services/repo-load-state';

@Component({
  selector: 'app-header',
  templateUrl: 'header.html',
  styleUrls: ['header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeasonHeader {
  @Input() sidenav: MatSidenav;

  constructor(public repoLoadState: RepoLoadState, public header: Header) {}

  leftButtonClicked() {
    if (this.header.goBack) {
      this.header.goBack();
    } else {
      this.sidenav.open();
    }
  }
}
