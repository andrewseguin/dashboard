
import {Item} from '../dao';
import {Sort} from './item-renderer-options';

export class ItemSorter {
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
