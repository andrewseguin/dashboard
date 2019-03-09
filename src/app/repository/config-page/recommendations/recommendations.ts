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
        return list.sort((a, b) => a.dateCreated > b.dateCreated ? -1 : 1);
      }));
  trackById = (_i, r: Recommendation) => r.id;
  constructor(public recommendationsDao: RecommendationsDao) {}

  add() {
    this.recommendationsDao.add({
      message: 'New recommendation',
      type: 'warning',
      actionType: 'add-label',
      action: {labels: []},
      filters: [],
      search: '',
    });
  }
}
