import {ChangeDetectionStrategy, Component, Input, SimpleChanges} from '@angular/core';
import {ItemsRenderer} from 'app/package/items-renderer/items-renderer';
import {Item, Widget} from 'app/repository/services/dao';
import {ItemsRendererFactory} from 'app/repository/services/items-renderer-factory';

@Component({
  selector: 'count',
  templateUrl: 'count.html',
  styleUrls: ['count.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Count {
  @Input() widget: Widget;

  private itemsRenderer: ItemsRenderer<Item>;

  constructor(private itemsRendererFactory: ItemsRendererFactory) {}

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['widget'] && this.widget) {
      this.setupItemsRenderer();
    }
  }

  private setupItemsRenderer() {
    this.itemsRenderer = this.itemsRendererFactory.create(this.widget.itemType);
    this.itemsRenderer.options.filters = this.widget.options.filters;
    this.itemsRenderer.options.search = this.widget.options.search;
  }
}
