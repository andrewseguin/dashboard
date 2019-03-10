import {Filter, MatcherContext} from 'app/repository/utility/search/filter';
import {Item, Label} from '../dao';
import {Recommendation} from '../dao/recommendations-dao';
import {ItemsFilterMetadata} from './items-filter-metadata';


export class ItemFilterer {
  constructor(
      private filters: Filter[], private labelsMap: Map<string, Label>,
      private recommendationsMap: Map<string, Recommendation[]>) {}

  filter(items: Item[]) {
    return items.filter(item => {
      return this.filters.every(filter => {
        if (!filter.query) {
          return true;
        }

        const recommendations = this.recommendationsMap.get(item.id);
        const context: MatcherContext = {
          item,
          labelsMap: this.labelsMap,
          recommendations,
        };
        return ItemsFilterMetadata.get(filter.type).matcher(context, filter.query);
      });
    });
  }
}
