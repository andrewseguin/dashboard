import {Injectable} from '@angular/core';
import {Repo, RepoDao} from 'app/repository/services/repo-dao';
import {
  getItemsMatchingFilterAndSearch
} from 'app/repository/utility/get-items-matching-filter-and-search';
import {BehaviorSubject, combineLatest, Subscription} from 'rxjs';
import {debounceTime, filter, startWith} from 'rxjs/operators';
import {ItemType} from '../dao';
import {Recommendation} from '../dao/recommendations-dao';
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

  constructor(private repoDao: RepoDao, private issuesRecommendations: ItemRecommendations) {}

  ngOnDestroy() {
    if (this.initSubscription) {
      this.initSubscription.unsubscribe();
    }
  }

  initialize(type: ItemType) {
    if (this.initSubscription) {
      this.initSubscription.unsubscribe();
    }

    const data: any[] = [
      this.repoDao.repo,
      this.issuesRecommendations.recommendations,
      this.options.changed.pipe(startWith(null)),
    ];

    this.initSubscription =
        combineLatest(data)
            .pipe(filter(result => !!result[0] && !!result[1]), debounceTime(50))
            .subscribe(result => {
              const repo = result[0] as Repo;
              const items = type === 'issue' ? repo.issues : repo.pullRequests;
              const recommendations = result[1] as Map<string, Recommendation[]>;

              // Filter and search
              const filterer = new ItemFilterer(this.options.filters, repo, recommendations);
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
