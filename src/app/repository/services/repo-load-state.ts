import {Injectable} from '@angular/core';
import {LoadedRepos} from 'app/service/loaded-repos';
import {combineLatest} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {ActivatedRepository} from './activated-repository';
import {ContributorsDao, ItemsDao, LabelsDao} from './dao';

export type RepoDaoType = 'items'|'labels'|'contributors';

@Injectable()
export class RepoLoadState {
  isEmpty = combineLatest(this.labelsDao.list, this.itemsDao.list, this.contributorsDao.list)
                .pipe(filter(results => results.every(v => !!v)), map(results => {
                        const labels = results[0]!;
                        const items = results[1]!;
                        const contributors = results[2]!;
                        return !labels.length && !items.length && !contributors.length;
                      }));

  isLoaded = combineLatest(this.activatedRepository.repository, this.loadedRepos.repos$)
                 .pipe(
                     filter(results => !!results[0]),
                     map(results => this.loadedRepos.isLoaded(results[0]!)));

  constructor(
      private activatedRepository: ActivatedRepository, private loadedRepos: LoadedRepos,
      private labelsDao: LabelsDao, private itemsDao: ItemsDao,
      private contributorsDao: ContributorsDao) {}
}
