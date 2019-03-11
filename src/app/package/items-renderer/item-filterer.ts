import {Filter, IFilterMetadata} from 'app/repository/utility/search/filter';


export class ItemFilterer<T, M> {
  constructor(
      private contextProvider: (item: T) => M,
      public tokenizeItem: (item: T) => string,
      private metadata: Map<string, IFilterMetadata<M, any>>) {}

  filter(items: T[], filters: Filter[], search: string) {
    const filteredItems = items.filter(item => {
      return filters.every(filter => {
        if (!filter.query) {
          return true;
        }

        const context = this.contextProvider(item);
        return this.metadata.get(filter.type).matcher(context, filter.query);
      });
    });

    return this.search(filteredItems, search);
  }

  private search(items: T[], search: string) {
    return !search ? items : items.filter(item => {
      const tokens = search.split(' OR ');
      return tokens.some(token => {
        const str = this.tokenizeItem(item);
        return str.indexOf(token.toLowerCase()) != -1;
      });
    });
  }
}
