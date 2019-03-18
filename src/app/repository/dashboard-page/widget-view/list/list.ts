import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  SimpleChanges
} from '@angular/core';
import {MatDialog} from '@angular/material';
import {View} from 'app/package/items-renderer/item-renderer-options';
import {ActiveRepo} from 'app/repository/services/active-repo';
import {Item, ItemListDisplayTypeOptions, Widget} from 'app/repository/services/dao';
import {getItemsList, GithubItemsRenderer} from 'app/repository/services/github-items-renderer';
import {ItemRecommendations} from 'app/repository/services/item-recommendations';
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

  public itemsRenderer = new GithubItemsRenderer(this.itemRecommendations, this.activeRepo);

  constructor(
      private dialog: MatDialog, private cd: ChangeDetectorRef,
      private itemRecommendations: ItemRecommendations, private activeRepo: ActiveRepo) {}

  ngOnInit() {
    this.itemsRenderer.connect().pipe(takeUntil(this.destroyed)).subscribe(result => {
      this.items = [];
      result.groups.forEach(itemGroup => this.items.push(...itemGroup.items));
      this.cd.markForCheck();
    });
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['widget'] && this.widget) {
      this.itemsRenderer.dataProvider =
          getItemsList(this.activeRepo.activeStore, this.widget.itemType);
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
