import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges
} from '@angular/core';
import {MatDialog} from '@angular/material';
import {Router} from '@angular/router';
import {ItemGrouping} from 'app/package/items-renderer/item-grouping';
import {ItemsRenderer} from 'app/package/items-renderer/items-renderer';
import {ActivatedRepository} from 'app/repository/services/activated-repository';
import {Item, ItemsDao, LabelsDao} from 'app/repository/services/dao';
import {Widget} from 'app/repository/services/dao/dashboards-dao';
import {ItemRecommendations} from 'app/repository/services/item-recommendations';
import {ItemDetailDialog} from 'app/repository/shared/dialog/item-detail-dialog/item-detail-dialog';
import {getItemsFilterer} from 'app/repository/utility/items-renderer/get-items-filterer';
import {MyItemSorter} from 'app/repository/utility/items-renderer/item-sorter';
import {Subject} from 'rxjs';
import {filter, map, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'widget-view',
  styleUrls: ['widget-view.scss'],
  templateUrl: 'widget-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'theme-background-card theme-border',
  },
  providers: [ItemsRenderer]
})
export class WidgetView {
  @Input() widget: Widget;

  @Input() editMode: boolean;

  @Input() dashboardId: string;

  @Output() edit = new EventEmitter<void>();

  @Output() remove = new EventEmitter<void>();

  items: Item[];

  trackByNumber = (_i: number, item: Item) => item.number;

  private destroyed = new Subject();

  constructor(
      public itemsRenderer: ItemsRenderer<Item>, private dialog: MatDialog,
      private cd: ChangeDetectorRef, private router: Router,
      private itemRecommendations: ItemRecommendations, private labelsDao: LabelsDao,
      private itemsDao: ItemsDao, private activatedRepository: ActivatedRepository) {}

  ngOnInit() {
    const items =
        this.itemsDao.list.pipe(filter(list => !!list), map(items => {
                                  const issues = items!.filter(item => !item.pr);
                                  const pullRequests = items!.filter(item => !!item.pr);
                                  return this.widget.itemType === 'issue' ? issues : pullRequests;
                                }));

    this.itemsRenderer.initialize(
        items, getItemsFilterer(this.itemRecommendations, this.labelsDao), new ItemGrouping(),
        new MyItemSorter());
    this.itemsRenderer.itemGroups
        .pipe(filter(itemGroups => !!itemGroups), takeUntil(this.destroyed))
        .subscribe(itemGroups => {
          this.items = [];
          itemGroups!.forEach(itemGroup => this.items.push(...itemGroup.items));
          this.cd.markForCheck();
        });
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['widget'] && this.widget) {
      const options = this.widget.options;

      if (!options) {
        throw Error('Missing options for widget ' + JSON.stringify(this.widget));
      }

      this.itemsRenderer.options.setState(options);
    }
  }

  openItemModal(itemId: string) {
    this.dialog.open(ItemDetailDialog, {data: {itemId}});
  }

  openQuery() {
    this.router.navigate(
        [`${this.activatedRepository.repository.value}/query/new`],
        {queryParams: {'widget': JSON.stringify(this.widget), dashboard: this.dashboardId}});
  }
}
