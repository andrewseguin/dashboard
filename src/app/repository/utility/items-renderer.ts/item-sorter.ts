import {Item} from 'app/repository/services/dao';
import {Sort} from 'app/repository/services/items-renderer/item-renderer-options';
import {ItemSorter} from 'app/repository/services/items-renderer/item-sorter';

export class MyItemSorter extends ItemSorter<Item> {
  getSortFunction(sort: Sort): (a: Item, b: Item) => number {
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
