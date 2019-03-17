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
import {ItemsRendererFactory} from 'app/repository/services/items-renderer-factory';
import {ItemDetailDialog} from 'app/repository/shared/dialog/item-detail-dialog/item-detail-dialog';
import {Subject, Subscription, Observable} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import { View } from 'app/package/items-renderer/item-renderer-options';

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

  private itemsRenderer: ItemsRenderer<Item>;

  private itemsRendererSubscription: Subscription;

  constructor(
      private dialog: MatDialog, private cd: ChangeDetectorRef,
      private itemsRendererFactory: ItemsRendererFactory) {}

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['widget'] && this.widget) {
      this.setupItemsRenderer();
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

  private setupItemsRenderer() {
    this.itemsRenderer = this.itemsRendererFactory.create(this.widget.itemType);
    this.itemsRenderer.options.setState(this.widget.options!);

    if (this.itemsRendererSubscription) {
      this.itemsRendererSubscription.unsubscribe();
    }

    // TODO: Shouldn't need this sub
    this.itemsRendererSubscription =
        this.itemsRenderer.itemGroups.pipe(takeUntil(this.destroyed)).subscribe(itemGroups => {
          this.items = [];
          itemGroups.forEach(itemGroup => this.items.push(...itemGroup.items));
          this.cd.markForCheck();
        });
  }
}
