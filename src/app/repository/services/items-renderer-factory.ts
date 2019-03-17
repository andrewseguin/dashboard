import {Injectable} from '@angular/core';
import {ItemsRenderer} from 'app/package/items-renderer/items-renderer';
import {map} from 'rxjs/operators';
import {getItemsFilterer} from '../utility/items-renderer/get-items-filterer';
import {getItemsGrouper} from '../utility/items-renderer/get-items-grouper';
import {MyItemSorter} from '../utility/items-renderer/item-sorter';
import {ActiveRepo} from './active-repo';
import {Item} from './dao';
import {ItemRecommendations} from './item-recommendations';

@Injectable()
export class ItemsRendererFactory {
  constructor(private itemRecommendations: ItemRecommendations, private activeRepo: ActiveRepo) {}

  create(type: 'issue'|'pr'): ItemsRenderer<Item> {
    const store = this.activeRepo.activeStore;
    const items = store.items.list.pipe(map(items => {
      const issues = items.filter(item => !item.pr);
      const pullRequests = items.filter(item => !!item.pr);
      return type === 'issue' ? issues : pullRequests;
    }));

    const itemsRenderer = new ItemsRenderer<Item>();
    itemsRenderer.initialize(
        items, getItemsFilterer(this.itemRecommendations, store.labels),
        getItemsGrouper(store.labels), new MyItemSorter());

    return itemsRenderer;
  }
}
