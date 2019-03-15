import {Injectable} from '@angular/core';
import {LoadedRepos} from 'app/service/loaded-repos';
import {combineLatest} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {ActiveRepo} from './active-repo';
import {Dao} from './dao/dao';

export type RepoDaoType = 'items'|'labels'|'contributors';

@Injectable()
export class RepoLoadState {
  isEmpty = combineLatest(this.dao.labels.list, this.dao.items.list, this.dao.contributors.list)
                .pipe(filter(results => results.every(v => !!v)), map(results => {
                        const labels = results[0]!;
                        const items = results[1]!;
                        const contributors = results[2]!;
                        return !labels.length && !items.length && !contributors.length;
                      }));

  isLoaded = combineLatest(this.activeRepo.repository, this.loadedRepos.repos$)
                 .pipe(
                     filter(results => !!results[0]),
                     map(results => this.loadedRepos.isLoaded(results[0]!)));

  constructor(private activeRepo: ActiveRepo, private loadedRepos: LoadedRepos, private dao: Dao) {}
}
