import {Injectable} from '@angular/core';
import {Repo, RepoDao} from 'app/service/repo-dao';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {filter, map, takeUntil} from 'rxjs/operators';

import {getRecommendations} from '../utility/get-recommendations';

import {Recommendation, RecommendationsDao} from './dao/recommendations-dao';

@Injectable()
export class IssueRecommendations {
  recommendations = new BehaviorSubject<Map<number, Recommendation[]>|null>(null);

  private destroyed = new Subject();

  constructor(private repoDao: RepoDao, private recommendationsDao: RecommendationsDao) {
    combineLatest(this.repoDao.repo, this.recommendationsDao.list)
        .pipe(filter(result => !!result[0] && !!result[1]), takeUntil(this.destroyed))
        .subscribe(result => {
          const repo = result[0] as Repo;
          const recommendations = result[1] as Recommendation[];

          const map = new Map<number, Recommendation[]>();
          [...repo.issues, ...repo.pullRequests].forEach(issue => {
            map.set(issue.number, getRecommendations(issue.number, repo, recommendations));
          });

          this.recommendations.next(map);
        });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
