import {Sort} from './issue-renderer-options';
import {Issue} from 'app/service/github';

export class IssueSorter {
  getSortFunction(sort: Sort) {
    switch (sort) {
      case 'created':
        return (a: Issue, b: Issue) => {
          return a.created > b.created ? -1 : 1;
        };
    }
  }
}
