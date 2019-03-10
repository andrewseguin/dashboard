import {Injectable} from '@angular/core';
import {RepoDao} from 'app/repository/services/dao/repo-dao';
import {
  getItemsMatchingFilterAndSearch
} from 'app/repository/utility/get-items-matching-filter-and-search';
import {BehaviorSubject, combineLatest, Subscription} from 'rxjs';
import {debounceTime, filter, startWith} from 'rxjs/operators';
import {ItemType, LabelsDao} from '../dao';
import {ItemRecommendations} from '../item-recommendations';
import {ItemFilterer} from './item-filterer';
import {ItemGroup, ItemGrouping} from './item-grouping';
import {ItemRendererOptions} from './item-renderer-options';
import {ItemSorter} from './item-sorter';


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

  initialize(type: ItemType) {
    if (this.initSubscription) {
      this.initSubscription.unsubscribe();
    }


    this.initSubscription =
        combineLatest([
          this.repoDao.repo,
          this.issuesRecommendations.recommendations,
          this.labelsDao.map,
          this.options.changed.pipe(startWith(null)),
        ])
            .pipe(filter(result => !!result[0] && !!result[1] && !!result[2]), debounceTime(50))
            .subscribe(result => {
              const repo = result[0];
              const items = type === 'issue' ? repo.issues : repo.pullRequests;
              const recommendations = result[1];
              const labelsMap = result[2];

              // Filter and search
              const filterer = new ItemFilterer(this.options.filters, labelsMap, recommendations);
              const filteredAndSearchedItems =
                  getItemsMatchingFilterAndSearch(items, filterer, this.options.search);

              // Group
              const grouper = new ItemGrouping(filteredAndSearchedItems, repo);
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
              this.itemCount.next(filteredAndSearchedItems.length);
            });
  }
}
