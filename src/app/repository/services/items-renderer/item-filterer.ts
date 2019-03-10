import {Repo} from 'app/repository/services/repo-dao';
import {Filter, MatcherContext} from 'app/repository/utility/search/filter';
import {Item} from '../dao';
import {Recommendation} from '../dao/recommendations-dao';
import {ItemsFilterMetadata} from './items-filter-metadata';


export class ItemFilterer {
  constructor(
      private filters: Filter[], private repo: Repo,
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
          repo: this.repo,
          recommendations,
        };
        return ItemsFilterMetadata.get(filter.type).matcher(context, filter.query);
      });
    });
  }
}
