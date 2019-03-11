
import {Sort} from './item-renderer-options';

export abstract class ItemSorter<T> {
  abstract getSortFunction(sort: Sort): (a: T, b: T) => number;
}
