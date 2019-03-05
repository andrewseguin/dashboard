import {Injectable} from '@angular/core';
import {Repo, RepoDao} from 'app/service/repo-dao';
import {combineLatest, Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {getRecommendations} from '../utility/get-recommendations';
import {Recommendation, RecommendationsDao} from './dao/recommendations-dao';
import {IssuesFilterMetadata} from './issues-renderer/issues-filter-metadata';

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

  get(issueId: number): Observable<Recommendation[]> {
    return combineLatest(this.repoDao.repo, this.recommendationsDao.list)
        .pipe(filter(result => !!result[0] && !!result[1]), map((result => {
                const repo = result[0] as Repo;
                const recommendations = result[1] as Recommendation[];
                return getRecommendations(issueId, repo, recommendations);
              })));
  }
}
