import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, Subject} from 'rxjs';
import {filter, map, takeUntil} from 'rxjs/operators';
import {getRecommendations} from '../utility/get-recommendations';
import {Recommendation} from './dao/recommendations-dao';
import { Dao } from './dao/dao';


@Injectable()
export class ItemRecommendations {
  allRecommendations = new BehaviorSubject<Map<string, Recommendation[]>|null>(null);

  warnings = this.allRecommendations.pipe(filter(map => !!map), map(allRecommendations => {
                                            const map = new Map<string, Recommendation[]>();
                                            allRecommendations!.forEach((value, key) => {
                                              map.set(key, value.filter(v => v.type === 'warning'));
                                            });
                                            return map;
                                          }));

  suggestions =
      this.allRecommendations.pipe(filter(map => !!map), map(allRecommendations => {
                                     const map = new Map<string, Recommendation[]>();
                                     allRecommendations!.forEach((value, key) => {
                                       map.set(key, value.filter(v => v.type === 'suggestion'));
                                     });
                                     return map;
                                   }));

  private destroyed = new Subject();

  constructor(private dao: Dao) {
    combineLatest(this.dao.items.map, this.dao.recommendations.list, this.dao.labels.map)
        .pipe(filter(result => result.every(r => !!r)), takeUntil(this.destroyed))
        .subscribe(result => {
          const items = result[0]!;
          const recommendations = result[1]!;
          const labelsMap = result[2]!;

          const map = new Map<string, Recommendation[]>();
          items.forEach(item => {
            map.set(item.id, getRecommendations(item.id, items, recommendations, labelsMap));
          });

          this.allRecommendations.next(map);
        });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
