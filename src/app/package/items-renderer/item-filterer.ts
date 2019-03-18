import {Filter, IFilterMetadata} from 'app/package/items-renderer/search-utility/filter';

export class ItemFilterer<T, M> {
  constructor(
      private contextProvider: (item: T) => M, public tokenizeItem: (item: T) => string,
      private metadata: Map<string, IFilterMetadata<M, any>>) {}

  filter(items: T[], filters: Filter[], search: string): T[] {
    const filteredItems = items.filter(item => {
      return filters.every(filter => {
        if (!filter.query) {
          return true;
        }

        const context = this.contextProvider(item);
        const filterConfig = this.metadata.get(filter.type);

        if (filterConfig && filterConfig.matcher) {
          return filterConfig.matcher(context, filter.query);
        } else {
          throw Error('Missing matcher for ' + filter.type);
        }
      });
    });

    return this.search(filteredItems, search);
  }

  private search(items: T[], search: string): T[] {
    return !search ? items : items.filter(item => {
      const tokens = search.split(' OR ');
      return tokens.some(token => {
        const str = this.tokenizeItem(item);
        return str.indexOf(token.toLowerCase()) != -1;
      });
    });
  }
}
