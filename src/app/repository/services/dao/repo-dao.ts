import {Injectable} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {Item, ItemsDao, PullRequest} from './items-dao';
import {LabelsDao} from './labels-dao';

export interface Repo {
  pullRequests: PullRequest[];
}

@Injectable()
export class RepoDao {
  repo: Observable<Repo> = combineLatest(this.itemsDao.list)
                               .pipe(filter(result => result.every(r => !!r)), map(result => {
                                       const issues = result[0].filter((issue: Item) => !issue.pr);
                                       const pullRequests =
                                           result[0].filter((issue: PullRequest) => !!issue.pr);

                                       const repo: Repo = {pullRequests};

                                       return repo;
                                     }));

  constructor(private labelsDao: LabelsDao, private itemsDao: ItemsDao) {}
}
