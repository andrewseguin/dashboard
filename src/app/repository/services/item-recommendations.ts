import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, Subject} from 'rxjs';
import {map, mergeMap, takeUntil} from 'rxjs/operators';
import {getRecommendations} from '../utility/get-recommendations';
import {ActiveRepo} from './active-repo';
import {Recommendation} from './dao/recommendation';


@Injectable()
export class ItemRecommendations {
  allRecommendations =
      new BehaviorSubject<Map<string, Recommendation[]>>(new Map<string, Recommendation[]>());

  warnings = this.allRecommendations.pipe(map(allRecommendations => {
    const map = new Map<string, Recommendation[]>();
    allRecommendations.forEach((value, key) => {
      map.set(key, value.filter(v => v.type === 'warning'));
    });
    return map;
  }));

  suggestions = this.allRecommendations.pipe(map(allRecommendations => {
    const map = new Map<string, Recommendation[]>();
    allRecommendations.forEach((value, key) => {
      map.set(key, value.filter(v => v.type === 'suggestion'));
    });
    return map;
  }));

  private destroyed = new Subject();

  constructor(private activeRepo: ActiveRepo) {
    this.activeRepo.store
        .pipe(
            mergeMap(
                store =>
                    combineLatest(store.items.map, store.recommendations.list, store.labels.map)),
            takeUntil(this.destroyed))
        .subscribe(result => {
          const items = result[0];
          const recommendations = result[1];
          const labelsMap = result[2];

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
