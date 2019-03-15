import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Github} from 'app/service/github';
import {LoadedRepos} from 'app/service/loaded-repos';

@Component({
  selector: 'home-page',
  templateUrl: 'home-page.html',
  styleUrls: ['home-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'theme-background',
  }
})
export class HomePage {
  popularTypescriptRepos = this.github.getMostPopularRepos();

  constructor(public loadedRepos: LoadedRepos, private github: Github) {
    this.loadedRepos.repos$.subscribe(console.log);
  }
}
