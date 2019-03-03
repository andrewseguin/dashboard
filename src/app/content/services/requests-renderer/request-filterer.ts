import {MatcherContext} from 'app/content/utility/search/filter';
import {Repo} from 'app/service/repo-dao';

import {IssuesFilterMetadata} from './issues-filter-metadata';
import {RequestRendererOptions} from './request-renderer-options';

export class RequestFilterer {
  constructor(private options: RequestRendererOptions) {}

  filter(repo: Repo) {
    return repo.issues.filter(issue => {
      return this.options.filters.every(filter => {
        if (!filter.query) {
          return true;
        }

        const context: MatcherContext = {
          issue,
          labels: repo.labels,
          contributors: repo.contributors
        };

        return IssuesFilterMetadata.get(filter.type)
            .matcher(context, filter.query);
      });
    });
  }
}
