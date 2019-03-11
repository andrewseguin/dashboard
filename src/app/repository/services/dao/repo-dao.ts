import {Injectable} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {Issue, Item, ItemsDao, PullRequest} from './items-dao';
import {LabelsDao} from './labels-dao';

export interface Repo {
  items: Item[];
  issues: Issue[];
  pullRequests: PullRequest[];
}

@Injectable()
export class RepoDao {
  repo: Observable<Repo> = combineLatest(this.itemsDao.list)
                               .pipe(filter(result => result.every(r => !!r)), map(result => {
                                       let items = result[0];
                                       const issues = result[0].filter((issue: Item) => !issue.pr);
                                       const pullRequests =
                                           result[0].filter((issue: PullRequest) => !!issue.pr);

                                       const repo: Repo = {items, issues, pullRequests};

                                       return repo;
                                     }));

  constructor(private labelsDao: LabelsDao, private itemsDao: ItemsDao) {}
}
