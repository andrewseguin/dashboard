import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  SimpleChanges
} from '@angular/core';
import {MatDialog} from '@angular/material';
import {View} from 'app/package/items-renderer/item-renderer-options';
import {Item, ItemListDisplayTypeOptions, ItemType, Widget} from 'app/repository/services/dao';
import {ItemsRendererFactory} from 'app/repository/services/items-renderer-factory';
import {ItemDetailDialog} from 'app/repository/shared/dialog/item-detail-dialog/item-detail-dialog';
import {Observable, Subject} from 'rxjs';
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

  items: Item[];

  listLength = 0;

  view: Observable<View>;

  private destroyed = new Subject();

  private itemType = new Subject<ItemType>();

  private itemsRenderer = this.itemsRendererFactory.create(this.itemType);

  constructor(
      private dialog: MatDialog, private cd: ChangeDetectorRef,
      private itemsRendererFactory: ItemsRendererFactory) {}

  ngOnInit() {
    this.itemsRenderer.connect().pipe(takeUntil(this.destroyed)).subscribe(result => {
      this.items = [];
      result.groups.forEach(itemGroup => this.items.push(...itemGroup.items));
      this.cd.markForCheck();
    });
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['widget'] && this.widget) {
      this.itemType.next(this.widget.itemType);
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
