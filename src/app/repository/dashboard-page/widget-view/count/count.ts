import {ChangeDetectionStrategy, Component, Input, SimpleChanges} from '@angular/core';
import {ItemsRenderer} from 'app/package/items-renderer/items-renderer';
import {Item, ItemCountWidget} from 'app/repository/services/dao';

@Component({
  selector: 'count',
  templateUrl: 'count.html',
  styleUrls: ['count.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Count {
  @Input() widget: ItemCountWidget;

  @Input() itemsRenderer: ItemsRenderer<Item>;

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['widget'] && this.widget) {
      this.itemsRenderer.options.filters = this.widget.options!.filters;
      this.itemsRenderer.options.search = this.widget.options!.search;
    }
  }
}
