import {ChangeDetectionStrategy, Component, Input, SimpleChanges} from '@angular/core';
import {ItemType, Widget} from 'app/repository/services/dao';
import {ItemsRendererFactory} from 'app/repository/services/items-renderer-factory';
import {Subject} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'count',
  templateUrl: 'count.html',
  styleUrls: ['count.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Count {
  @Input() widget: Widget;

  private itemType = new Subject<ItemType>();

  private itemsRenderer = this.itemsRendererFactory.create(this.itemType);

  count = this.itemsRenderer.connect().pipe(map(result => result.count));

  constructor(private itemsRendererFactory: ItemsRendererFactory) {}

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['widget'] && this.widget) {
      this.itemType.next(this.widget.itemType);
      this.itemsRenderer.options.filters = this.widget.options.filters;
      this.itemsRenderer.options.search = this.widget.options.search;
    }
  }
}
