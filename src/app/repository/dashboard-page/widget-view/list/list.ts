import {ChangeDetectionStrategy, Component, Input, SimpleChanges} from '@angular/core';
import {ItemsRenderer} from 'app/package/items-renderer/items-renderer';
import {IssueListWidget, Item} from 'app/repository/services/dao';

@Component({
  selector: 'list',
  templateUrl: 'list.html',
  styleUrls: ['list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class List {
  @Input() widget: IssueListWidget;

  @Input() itemsRenderer: ItemsRenderer<Item>;

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['widget'] && this.widget) {
      this.itemsRenderer.options.setState(this.widget.options!);
    }
  }
}
