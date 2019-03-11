import {Injectable} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {ContributorsDao} from './contributors-dao';
import {Issue, Item, ItemsDao, PullRequest} from './items-dao';
import {Label, LabelsDao} from './labels-dao';

export interface Repo {
  empty: boolean;
  items: Item[];
  itemsMap: Map<string, Item>;
  issues: Issue[];
  issuesMap: Map<string, Item>;
  pullRequests: PullRequest[];
  pullRequestsMap: Map<string, PullRequest>;
}

@Injectable()
export class RepoDao {
  repo: Observable<Repo> = combineLatest(this.itemsDao.list, this.labelsDao.list)
                               .pipe(filter(result => result.every(r => !!r)), map(result => {
                                       let items = result[0];
                                       let labels = result[1];

                                       const itemsMap = new Map<string, PullRequest>();
                                       items.forEach(o => itemsMap.set(o.id, o));

                                       const issues = result[0].filter((issue: Item) => !issue.pr);
                                       const issuesMap = new Map<string, Item>();
                                       issues.forEach(o => issuesMap.set(o.id, o));

                                       const pullRequests =
                                           result[0].filter((issue: PullRequest) => !!issue.pr);
                                       const pullRequestsMap = new Map<string, PullRequest>();
                                       issues.forEach(o => issuesMap.set(o.id, o));

                                       const labelsMap = new Map<string, Label>();
                                       labels.forEach(o => labelsMap.set(o.id, o));
                                       labels.forEach(o => labelsMap.set(o.name, o));

                                       return {
                                         items,
                                         itemsMap,
                                         issues,
                                         issuesMap,
                                         pullRequests,
                                         pullRequestsMap,
                                         labels,
                                         labelsMap,
                                         empty: ![...issues, ...labels].length
                                       };
                                     }));

  constructor(
      private labelsDao: LabelsDao, private itemsDao: ItemsDao,
      private contributorsDao: ContributorsDao) {}
}
