import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  SimpleChanges
} from '@angular/core';
import {MatDialog} from '@angular/material';
import {ItemsRenderer} from 'app/package/items-renderer/items-renderer';
import {Item, ItemListDisplayTypeOptions, Widget} from 'app/repository/services/dao';
import {ItemDetailDialog} from 'app/repository/shared/dialog/item-detail-dialog/item-detail-dialog';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'list',
  templateUrl: 'list.html',
  styleUrls: ['list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class List {
  trackById = (_i: number, item: Item) => item.id;

  @Input() widget: Widget;

  @Input() itemsRenderer: ItemsRenderer<Item>;

  items: Item[];

  listLength = 0;

  private destroyed = new Subject();

  constructor(private dialog: MatDialog, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.itemsRenderer.itemGroups.pipe(takeUntil(this.destroyed)).subscribe(itemGroups => {
      this.items = [];
      itemGroups.forEach(itemGroup => this.items.push(...itemGroup.items));
      this.cd.markForCheck();
    });
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['widget'] && this.widget) {
      this.itemsRenderer.options.setState(this.widget.options!);
      this.listLength = (this.widget.displayTypeOptions as ItemListDisplayTypeOptions).listLength;
    }
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  openItemModal(itemId: number) {
    this.dialog.open(ItemDetailDialog, {data: {itemId: `${itemId}`}, width: '80vw'});
  }
}
