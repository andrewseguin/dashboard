import {Item} from 'app/service/github';

import {Sort} from './issue-renderer-options';

export class IssueSorter {
  getSortFunction(sort: Sort) {
    switch (sort) {
      case 'created':
        return (a: Item, b: Item) => {
          return a.created < b.created ? -1 : 1;
        };
      case 'title':
        return (a: Item, b: Item) => {
          return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
        };
    }
  }
}
