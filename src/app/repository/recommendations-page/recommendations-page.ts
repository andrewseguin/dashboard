import {ChangeDetectionStrategy, Component} from '@angular/core';
import {filter, map, tap} from 'rxjs/operators';
import {Recommendation, RecommendationsDao} from '../services/dao';

@Component({
  selector: 'recommendations-page',
  styleUrls: ['recommendations-page.scss'],
  templateUrl: 'recommendations-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendationsPage {
  sortedRecommendations = this.recommendationsDao.list.pipe(
      filter(list => !!list), map(list => {
        return list!.sort((a, b) => a.dbAdded! > b.dbAdded!? -1 : 1);
      }),
      tap(console.log));
  trackById = (_i: number, r: Recommendation) => r.id;
  constructor(public recommendationsDao: RecommendationsDao) {}

  add() {
    this.recommendationsDao.add({
      message: 'New recommendation',
      type: 'warning',
      actionType: 'none',
      action: {labels: []},
      filters: [],
      search: '',
    });
  }
}
