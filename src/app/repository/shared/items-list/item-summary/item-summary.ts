import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges
} from '@angular/core';
import {ItemViewer, ViewingMetadata} from 'app/package/items-renderer/item-viewer';
import {Item} from 'app/repository/services/dao';
import {ItemRecommendations} from 'app/repository/services/item-recommendations';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'item-summary',
  templateUrl: 'item-summary.html',
  styleUrls: ['item-summary.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'(click)': 'select.emit(this.item.number)'}
})
export class ItemSummary<V> {
  warnings = this.itemRecommendations.warnings.pipe(map(map => map.get(this.item.id)));
  suggestions = this.itemRecommendations.suggestions.pipe(map(map => map.get(this.item.id)));

  views: Observable<ViewingMetadata<V, any>[]>;

  @Input() item: Item;

  @Input() active: boolean;

  @Input() viewer: ItemViewer<any, V, any>;

  @Output() select = new EventEmitter<number>();

  constructor(public itemRecommendations: ItemRecommendations) {}

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['viewer'] && this.viewer) {
      this.views = this.viewer.state.pipe(map(state => {
        const enabledViews =
            this.viewer.getViews().filter(view => state.views.indexOf(view.id) !== -1);
        return enabledViews.map(view => this.viewer.metadata.get(view.id)!);
      }));
    }
  }
}
