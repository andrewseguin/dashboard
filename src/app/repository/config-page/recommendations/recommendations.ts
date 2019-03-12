import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Recommendation, RecommendationsDao} from 'app/repository/services/dao/recommendations-dao';
import {filter, map} from 'rxjs/operators';

@Component({
  selector: 'recommendations',
  styleUrls: ['recommendations.scss'],
  templateUrl: 'recommendations.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Recommendations {
  sortedRecommendations = this.recommendationsDao.list.pipe(
      filter(list => !!list), map(list => {
        return list!.sort((a, b) => a.dbAdded! > b.dbAdded!? -1 : 1);
      }));
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
