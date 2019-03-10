import {Injectable} from '@angular/core';
import {RepoDao} from 'app/repository/services/dao/repo-dao';
import {MatcherContext} from 'app/repository/utility/search/filter';
import {tokenizeItem} from 'app/repository/utility/tokenize-item';
import {BehaviorSubject, combineLatest, Observable, Subscription} from 'rxjs';
import {debounceTime, filter, map, startWith} from 'rxjs/operators';
import {Item, LabelsDao} from '../dao';
import {ItemRecommendations} from '../item-recommendations';
import {ItemFilterer} from './item-filterer';
import {ItemGroup, ItemGrouping} from './item-grouping';
import {ItemRendererOptions} from './item-renderer-options';
import {ItemSorter} from './item-sorter';
import {ItemsFilterMetadata} from './items-filter-metadata';


@Injectable()
export class ItemsRenderer {
  options: ItemRendererOptions = new ItemRendererOptions();

  // Starts as null as a signal that no items have been processed.
  itemGroups = new BehaviorSubject<ItemGroup[]|null>(null);

  // Number of items in the item groups.
  itemCount = new BehaviorSubject<number|null>(null);

  private initSubscription: Subscription;

  constructor(
      private repoDao: RepoDao, private issuesRecommendations: ItemRecommendations,
      private labelsDao: LabelsDao) {}

  ngOnDestroy() {
    if (this.initSubscription) {
      this.initSubscription.unsubscribe();
    }
  }

  initialize(items: Observable<Item[]>, filterer: Observable<ItemFilterer<any, any>>) {
    if (this.initSubscription) {
      this.initSubscription.unsubscribe();
    }

    this.initSubscription =
        combineLatest([
          this.repoDao.repo,
          filterer,
          items,
          this.options.changed.pipe(startWith(null)),
        ])
            .pipe(filter(result => !!result[0] && !!result[1] && !!result[2]), debounceTime(50))
            .subscribe(result => {
              const repo = result[0];
              const filterer = result[1];
              const items = result[2];

              // Filter and search
              const filteredItems =
                  filterer.filter(items, this.options.filters, this.options.search);

              // Group
              const grouper = new ItemGrouping(filteredItems, repo);
              let itemGroups = grouper.getGroup(this.options.grouping);
              itemGroups = itemGroups.sort((a, b) => a.title < b.title ? -1 : 1);

              // Sort
              const sorter = new ItemSorter();
              itemGroups.forEach(group => {
                const sort = this.options.sorting;
                const sortFn = sorter.getSortFunction(sort);
                group.items = group.items.sort(sortFn);

                if (this.options.reverseSort) {
                  group.items = group.items.reverse();
                }
              });

              this.itemGroups.next(itemGroups);
              this.itemCount.next(filteredItems.length);
            });
  }
}
