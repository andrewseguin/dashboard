import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatSidenav} from '@angular/material';
import {ActiveStore} from 'app/repository/services/active-store';
import {Header} from 'app/repository/services/header';
import {isRepoStoreEmpty} from 'app/repository/utility/is-repo-store-empty';
import {mergeMap} from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: 'header.html',
  styleUrls: ['header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeasonHeader {
  isEmpty = this.activeStore.data.pipe(mergeMap(store => isRepoStoreEmpty(store)));

  @Input() sidenav: MatSidenav;

  constructor(public header: Header, private activeStore: ActiveStore) {}

  leftButtonClicked() {
    if (this.header.goBack) {
      this.header.goBack();
    } else {
      this.sidenav.open();
    }
  }
}
