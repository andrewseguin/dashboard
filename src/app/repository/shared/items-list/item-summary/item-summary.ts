import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges
} from '@angular/core';
import {Item} from 'app/repository/services/dao';
import {ItemRecommendations} from 'app/repository/services/item-recommendations';
import {GithubItemView} from 'app/repository/utility/github-data-source/item-viewer-metadata';
import {map} from 'rxjs/operators';

@Component({
  selector: 'item-summary',
  templateUrl: 'item-summary.html',
  styleUrls: ['item-summary.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'(click)': 'select.emit(this.item.number)'}
})
export class ItemSummary {
  warnings = this.itemRecommendations.warnings.pipe(map(map => map.get(this.item.id)));
  suggestions = this.itemRecommendations.suggestions.pipe(map(map => map.get(this.item.id)));

  enabledViewsSet = new Set<GithubItemView>();

  @Input() item: Item;

  @Input() active: boolean;

  @Input() enabledViews: GithubItemView[];

  @Output() select = new EventEmitter<number>();

  constructor(public itemRecommendations: ItemRecommendations) {}

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['enabledViews'] && this.enabledViews) {
      this.enabledViewsSet = new Set<GithubItemView>();
      this.enabledViews.forEach(v => this.enabledViewsSet.add(v));
    }
  }
}
