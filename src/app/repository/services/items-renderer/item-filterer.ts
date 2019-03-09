import {Filter, MatcherContext} from 'app/repository/utility/search/filter';
import {Item} from 'app/service/github';
import {Repo} from 'app/service/repo-dao';

import {Recommendation} from '../dao/recommendations-dao';

import {ItemsFilterMetadata} from './items-filter-metadata';

export class ItemFilterer {
  constructor(
      private filters: Filter[], private repo: Repo,
      private recommendationsMap: Map<number, Recommendation[]>) {}

  filter(items: Item[]) {
    return items.filter(item => {
      return this.filters.every(filter => {
        if (!filter.query) {
          return true;
        }

        const recommendations = this.recommendationsMap.get(item.number);
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
