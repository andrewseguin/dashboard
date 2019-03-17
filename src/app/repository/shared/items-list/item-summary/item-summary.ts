import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import {ItemsRenderer} from 'app/package/items-renderer/items-renderer';
import {Item} from 'app/repository/services/dao';
import {ItemRecommendations} from 'app/repository/services/item-recommendations';
import {Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';

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

  @Output() select = new EventEmitter<number>();

  constructor(
      public itemRecommendations: ItemRecommendations, private cd: ChangeDetectorRef,
      public itemsRenderer: ItemsRenderer<any>) {
    this.itemsRenderer.options.changed.pipe(takeUntil(this.destroyed))
        .subscribe(() => this.cd.markForCheck());
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
