import {Injectable} from '@angular/core';
import {Issue, Label} from 'app/service/github';
import {Repo, RepoDao} from 'app/service/repo-dao';
import {combineLatest, Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';

import {issueMatchesSearch} from '../utility/issue-matches-search';

import {Recommendation, RecommendationsDao} from './dao/recommendations-dao';
import {IssueFilterer} from './issues-renderer/issue-filterer';

@Injectable()
export class IssueRecommendations {
  context: Observable<{repo: Repo, recommendations: Recommendation[]}> =
      combineLatest(this.repoDao.repo, this.recommendationsDao.list)
          .pipe(filter(result => !!result[0] && !!result[1]), map(result => {
                  return {repo: result[0], recommendations: result[1]};
                }));

  constructor(
      private repoDao: RepoDao,
      private recommendationsDao: RecommendationsDao) {}

  get(issueId: number): Observable<Recommendation[]|any> {
    return this.context.pipe(map(context => {
      const issue = context.repo.issuesMap.get(issueId);
      return context.recommendations.filter(recommendation => {
        const issueFilterer = new IssueFilterer(recommendation.filters);
        const passesFilter =
            !!issueFilterer.filter([issue], context.repo).length;
        if (!passesFilter) {
          return false;
        }

        return issueMatchesSearch(recommendation.search, issue);
      });
    }));
  }
}
