import {Filter, MatcherContext} from 'app/repository/utility/search/filter';
import {Issue} from 'app/service/github';
import {Repo} from 'app/service/repo-dao';

import {IssueRendererOptions} from './issue-renderer-options';
import {IssuesFilterMetadata} from './issues-filter-metadata';

export class IssueFilterer {
  constructor(private filters: Filter[]) {}

  filter(issues: Issue[], repo: Repo) {
    return issues.filter(issue => {
      return this.filters.every(filter => {
        if (!filter.query) {
          return true;
        }

        const context: MatcherContext = {
          issue,
          labels: repo.labelsMap,
          contributors: repo.contributorsMap
        };

        return IssuesFilterMetadata.get(filter.type)
            .matcher(context, filter.query);
      });
    });
  }
}
