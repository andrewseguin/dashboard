import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {View} from 'app/package/items-renderer/item-renderer-options';
import {Item} from 'app/repository/services/dao';
import {ItemRecommendations} from 'app/repository/services/item-recommendations';
import {Subject} from 'rxjs';
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

  private destroyed = new Subject();

  @Input() item: Item;

  @Input() active: boolean;

  @Input() view: View;

  @Output() select = new EventEmitter<number>();

  constructor(public itemRecommendations: ItemRecommendations) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
