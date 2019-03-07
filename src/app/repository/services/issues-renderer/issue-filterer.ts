import {Filter, MatcherContext} from 'app/repository/utility/search/filter';
import {Item} from 'app/service/github';
import {Repo} from 'app/service/repo-dao';

import {Recommendation} from '../dao/recommendations-dao';

import {IssuesFilterMetadata} from './issues-filter-metadata';

export class IssueFilterer {
  constructor(
      private filters: Filter[], private repo: Repo,
      private recommendationsMap: Map<number, Recommendation[]>) {}

  filter(issues: Item[]) {
    return issues.filter(issue => {
      return this.filters.every(filter => {
        if (!filter.query) {
          return true;
        }

        const recommendations = this.recommendationsMap.get(issue.number);
        const context: MatcherContext = {
          issue,
          repo: this.repo,
          recommendations,
        };
        return IssuesFilterMetadata.get(filter.type).matcher(context, filter.query);
      });
    });
  }
}
