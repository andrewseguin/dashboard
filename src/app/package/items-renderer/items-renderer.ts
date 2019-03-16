import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subscription} from 'rxjs';
import {filter, startWith} from 'rxjs/operators';
import {ItemFilterer} from './item-filterer';
import {ItemGroup, ItemGrouping} from './item-grouping';
import {ItemRendererOptions} from './item-renderer-options';
import {ItemSorter} from './item-sorter';


@Injectable()
export class ItemsRenderer<T> {
  options: ItemRendererOptions = new ItemRendererOptions();

  _itemGroups = new BehaviorSubject<ItemGroup<T>[]|null>(null);
  itemGroups = this._itemGroups.pipe(filter(v => !!v)) as Observable<ItemGroup<T>[]>;

  // Number of items in the item groups.
  itemCount = new BehaviorSubject<number|null>(null);

  private initSubscription: Subscription;

  constructor() {}

  ngOnDestroy() {
    if (this.initSubscription) {
      this.initSubscription.unsubscribe();
    }
  }

  initialize(
      items: Observable<T[]>, filterer: Observable<ItemFilterer<T, any>>,
      grouper: Observable<ItemGrouping<T>>, sorter: ItemSorter<T>) {
    if (this.initSubscription) {
      this.initSubscription.unsubscribe();
    }

    this.initSubscription =
        combineLatest([
          filterer,
          items,
          grouper,
          this.options.changed.pipe(startWith(null)),
        ])
            .pipe(filter(result => !!result[0] && !!result[1] && !!result[2]))
            .subscribe(result => {
              const filterer = result[0];
              const items = result[1];
              const grouper = result[2];

              const filteredItems =
                  filterer.filter(items, this.options.filters, this.options.search);
              let itemGroups = grouper.getGroups(filteredItems, this.options.grouping);

              itemGroups = itemGroups.sort((a, b) => a.title < b.title ? -1 : 1);

              // Sort
              itemGroups.forEach(group => {
                const sort = this.options.sorting;
                const sortFn = sorter.getSortFunction(sort);
                group.items = group.items.sort(sortFn);

                if (this.options.reverseSort) {
                  group.items = group.items.reverse();
                }
              });

              this._itemGroups.next(itemGroups);
              this.itemCount.next(filteredItems.length);
            });
  }
}
