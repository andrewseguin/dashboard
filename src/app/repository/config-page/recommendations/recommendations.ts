import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RecommendationsDao, Recommendation} from 'app/repository/services/dao/recommendations-dao';

@Component({
  selector: 'recommendations',
  styleUrls: ['recommendations.scss'],
  templateUrl: 'recommendations.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Recommendations {
  trackById = (_i, r: Recommendation) => r.id;
  constructor(public recommendationsDao: RecommendationsDao) {}
}
