import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatSidenav} from '@angular/material';
import {ActivatedRepository} from 'app/repository/services/activated-repository';
import {Header} from 'app/repository/services/header';
import {LoadedRepos} from 'app/service/loaded-repos';
import {combineLatest} from 'rxjs';
import {filter, map} from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: 'header.html',
  styleUrls: ['header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeasonHeader {
  @Input() sidenav: MatSidenav;

  isLoaded = combineLatest(this.activatedRepository.repository, this.loadedRepos.repos$)
                 .pipe(
                     filter(results => results.every(v => !!v)),
                     map(results => this.loadedRepos.isLoaded(results[0]!)));

  constructor(
      public header: Header, private loadedRepos: LoadedRepos,
      private activatedRepository: ActivatedRepository) {}

  leftButtonClicked() {
    if (this.header.goBack) {
      this.header.goBack();
    } else {
      this.sidenav.open();
    }
  }
}
