import {Issue} from 'app/service/github';
import {Repo} from 'app/service/repo-dao';

import {SortId} from './issues-page';

export function getSortFunction(sort: SortId, repo: Repo): (
    a: Issue, b: Issue) => number {
  switch (sort) {
    case 'created':
      return (a: Issue, b: Issue) => {
        return a.created > b.created ? -1 : 1;
      };
  }
}
