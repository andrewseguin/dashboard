import {Injectable} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {Repo} from '../repo-dao';
import {Contributor, ContributorsDao} from './contributors-dao';
import {Item, ItemsDao, PullRequest} from './items-dao';
import {Label, LabelsDao} from './labels-dao';

@Injectable()
export class RepoDao2 {
  repo: Observable<Repo> =
      combineLatest(this.itemsDao.list, this.labelsDao.list, this.contributorsDao.list)
          .pipe(filter(result => !!result[0] && !!result[1] && !!result[2]), map(result => {
                  let items = result[0] as Item[];
                  let labels = result[1] as Label[];
                  let contributors = result[2] as Contributor[];


                  const itemsMap = new Map<string, PullRequest>();
                  items.forEach(o => itemsMap.set(o.id, o));

                  const issues = result[0].filter((issue: Item) => !issue.pr);
                  const issuesMap = new Map<string, Item>();
                  issues.forEach(o => issuesMap.set(o.id, o));

                  const pullRequests = result[0].filter((issue: PullRequest) => !!issue.pr);
                  const pullRequestsMap = new Map<string, PullRequest>();
                  issues.forEach(o => issuesMap.set(o.id, o));

                  const labelsMap = new Map<string, Label>();
                  labels.forEach(o => labelsMap.set(o.id, o));
                  labels.forEach(o => labelsMap.set(o.name, o));

                  const contributorsMap = new Map<string, Contributor>();
                  contributors.forEach(o => contributorsMap.set(o.id, o));

                  return {
                    items,
                    itemsMap,
                    issues,
                    issuesMap,
                    pullRequests,
                    pullRequestsMap,
                    labels,
                    labelsMap,
                    contributors,
                    contributorsMap,
                    empty: ![...issues, ...labels, ...contributors].length
                  };
                }));

  constructor(
      private labelsDao: LabelsDao, private itemsDao: ItemsDao,
      private contributorsDao: ContributorsDao) {}
}
