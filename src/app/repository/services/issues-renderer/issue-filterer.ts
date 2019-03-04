import {MatcherContext} from 'app/repository/utility/search/filter';
import {Repo} from 'app/service/repo-dao';

import {IssuesFilterMetadata} from './issues-filter-metadata';
import {IssueRendererOptions} from './issue-renderer-options';

export class IssueFilterer {
  constructor(private options: IssueRendererOptions) {}

  filter(repo: Repo) {
    return repo.issues.filter(issue => {
      return this.options.filters.every(filter => {
        if (!filter.query) {
          return true;
        }

        const context: MatcherContext = {
          issue,
          labels: repo.labelsMap,
          contributors: repo.contributorsMap
        };

        return IssuesFilterMetadata.get(filter.type).matcher(context, filter.query);
      });
    });
  }
}
