import {CdkPortal} from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {combineLatest} from 'rxjs';
import {delay, map, mergeMap, startWith} from 'rxjs/operators';
import {Header} from '../services';
import {ActiveStore} from '../services/active-repo';
import {Recommendation} from '../services/dao';
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

  @ViewChild(CdkPortal) toolbarActions: CdkPortal;

  sortedRecommendations = this.activeRepo.config.pipe(
      delay(150),
      mergeMap(
          store => combineLatest(
              store.recommendations.list, this.filter.valueChanges.pipe(startWith('')))),
      map(result => {
        const filtered = result[0].filter(r => this.matchesFilter(r));
        return filtered.sort((a, b) => (a.dbAdded! > b.dbAdded!) ? -1 : 1);
      }));
  trackById = (_i: number, r: Recommendation) => r.id;

  constructor(private header: Header, private activeRepo: ActiveStore) {}

  ngOnInit() {
    this.header.toolbarOutlet.next(this.toolbarActions);
  }

  ngOnDestroy() {
    this.header.toolbarOutlet.next(null);
  }


  add() {
    this.activeRepo.activeConfig.recommendations.add({
      message: 'New recommendation',
      type: 'warning',
      actionType: 'none',
      action: {labels: []},
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
