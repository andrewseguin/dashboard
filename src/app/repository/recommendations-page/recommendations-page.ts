import {ChangeDetectionStrategy, Component, QueryList, ViewChildren} from '@angular/core';
import {FormControl} from '@angular/forms';
import {combineLatest} from 'rxjs';
import {filter, map, startWith} from 'rxjs/operators';
import {Recommendation, RecommendationsDao} from '../services/dao';
import {EditableRecommendation} from './editable-recommendation/editable-recommendation';

@Component({
  selector: 'recommendations-page',
  styleUrls: ['recommendations-page.scss'],
  templateUrl: 'recommendations-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendationsPage {
  filter = new FormControl('');

  @ViewChildren(EditableRecommendation) editableRecommendations: QueryList<EditableRecommendation>;

  sortedRecommendations =
      combineLatest(this.recommendationsDao.list, this.filter.valueChanges.pipe(startWith('')))
          .pipe(filter(results => !!results[0]), map(result => {
                  const filtered = result[0]!.filter(r => this.matchesFilter(r));
                  return filtered.sort((a, b) => (a.dbAdded! > b.dbAdded!) ? -1 : 1);
                }));
  trackById = (_i: number, r: Recommendation) => r.id;
  constructor(public recommendationsDao: RecommendationsDao) {}

  add() {
    this.recommendationsDao.add({
      message: 'New recommendation',
      type: 'warning',
      actionType: 'none',
      action: {labels: []},
      filters: [{query: {equality: 'is', state: 'open'}, type: 'state'}],
      search: '',
    });
  }

  expandAll() {
    this.editableRecommendations.forEach(v => v.expand());
  }

  matchesFilter(recommendation: Recommendation) {
    const values: any[] = [];
    Object.keys(recommendation)
        .forEach(key => values.push(JSON.stringify((recommendation as any)[key] as any)));
    return values.join(';').toLowerCase().indexOf(this.filter.value.toLowerCase()) != -1;
  }
}
