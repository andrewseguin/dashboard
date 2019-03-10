import {Injectable} from '@angular/core';
import {Repo, RepoDao} from 'app/repository/services/dao/repo-dao';
import {BehaviorSubject, combineLatest, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {getRecommendations} from '../utility/get-recommendations';
import {Recommendation, RecommendationsDao} from './dao/recommendations-dao';


@Injectable()
export class ItemRecommendations {
  recommendations = new BehaviorSubject<Map<string, Recommendation[]>|null>(null);

  private destroyed = new Subject();

  constructor(private repoDao: RepoDao, private recommendationsDao: RecommendationsDao) {
    combineLatest(this.repoDao.repo, this.recommendationsDao.list)
        .pipe(filter(result => !!result[0] && !!result[1]), takeUntil(this.destroyed))
        .subscribe(result => {
          const repo = result[0] as Repo;
          const recommendations = result[1] as Recommendation[];

          const map = new Map<string, Recommendation[]>();
          [...repo.issues, ...repo.pullRequests].forEach(item => {
            map.set(item.id, getRecommendations(item.id, repo, recommendations));
          });

          this.recommendations.next(map);
        });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
