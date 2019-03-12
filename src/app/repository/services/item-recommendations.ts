import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {getRecommendations} from '../utility/get-recommendations';
import {ItemsDao, LabelsDao} from './dao';
import {Recommendation, RecommendationsDao} from './dao/recommendations-dao';


@Injectable()
export class ItemRecommendations {
  recommendations = new BehaviorSubject<Map<string, Recommendation[]>|null>(null);

  private destroyed = new Subject();

  constructor(
      private recommendationsDao: RecommendationsDao, private itemsDao: ItemsDao,
      private labelsDao: LabelsDao) {
    combineLatest(this.itemsDao.map, this.recommendationsDao.list, this.labelsDao.map)
        .pipe(filter(result => result.every(r => !!r)), takeUntil(this.destroyed))
        .subscribe(result => {
          const items = result[0];
          const recommendations = result[1];
          const labelsMap = result[2];

          const map = new Map<string, Recommendation[]>();
          items.forEach(item => {
            map.set(item.id, getRecommendations(item.id, items, recommendations, labelsMap));
          });

          this.recommendations.next(map);
        });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
