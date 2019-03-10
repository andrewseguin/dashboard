
import {Item} from '../services/dao';
import {ItemFilterer} from '../services/items-renderer/item-filterer';
import {itemMatchesSearch} from './item-matches-search';


export function getItemsMatchingFilterAndSearch(
    items: Item[], filterer: ItemFilterer, search: string) {
  let filteredItems = filterer.filter(items);
  return !search ? filteredItems : filteredItems.filter(item => {
    const searchTokens = search.split(' OR ');
    return searchTokens.some(searchToken => itemMatchesSearch(searchToken, item));
  });
}
