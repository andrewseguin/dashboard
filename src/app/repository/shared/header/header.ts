import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatSidenav} from '@angular/material';
import {ActiveRepo} from 'app/repository/services/active-repo';
import {Dao} from 'app/repository/services/dao/dao';
import {Header} from 'app/repository/services/header';
import {isRepoStoreEmpty} from 'app/repository/services/repo-load-state';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: 'header.html',
  styleUrls: ['header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeasonHeader {
  isEmpty =
      this.activeRepo.change.pipe(map(repository => isRepoStoreEmpty(this.dao.get(repository))));

  @Input() sidenav: MatSidenav;

  constructor(public header: Header, private activeRepo: ActiveRepo, private dao: Dao) {}

  leftButtonClicked() {
    if (this.header.goBack) {
      this.header.goBack();
    } else {
      this.sidenav.open();
    }
  }
}
