import {Filter, MatcherContext} from 'app/repository/utility/search/filter';
import {Issue} from 'app/service/github';
import {Repo} from 'app/service/repo-dao';
import {IssuesFilterMetadata} from './issues-filter-metadata';

export class IssueFilterer {
  constructor(private filters: Filter[], private repo: Repo) {}

  filter(issues: Issue[]) {
    return issues.filter(issue => {
      return this.filters.every(filter => {
        if (!filter.query) {
          return true;
        }

        const context: MatcherContext = {
          issue,
          repo: this.repo,
        };
        return IssuesFilterMetadata.get(filter.type)
            .matcher(context, filter.query);
      });
    });
  }
}
