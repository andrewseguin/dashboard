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
import {ActivatedRepository} from 'app/repository/services/activated-repository';
import {Widget} from 'app/repository/services/dao/dashboards-dao';
import {ItemsRenderer} from 'app/repository/services/items-renderer/items-renderer';
import {ItemDetailDialog} from 'app/repository/shared/dialog/item-detail-dialog/item-detail-dialog';
import {Item} from 'app/service/github';
import {Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';

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

  trackByNumber = (_i, item: Item) => item.number;

  private destroyed = new Subject();

  constructor(
      public itemsRenderer: ItemsRenderer, private dialog: MatDialog, private cd: ChangeDetectorRef,
      private router: Router, private activatedRepository: ActivatedRepository) {}

  ngOnInit() {
    this.itemsRenderer.initialize(this.widget.itemType);
    this.itemsRenderer.itemGroups
        .pipe(filter(itemGroups => !!itemGroups), takeUntil(this.destroyed))
        .subscribe(itemGroups => {
          this.items = [];
          itemGroups.forEach(itemGroup => this.items.push(...itemGroup.items));
          this.cd.markForCheck();
        });
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['widget'] && this.widget) {
      this.itemsRenderer.options.setState(this.widget.options);
    }
  }

  openItemModal(itemId: number) {
    this.dialog.open(ItemDetailDialog, {data: {itemId}});
  }

  openQuery() {
    this.router.navigate(
        [`${this.activatedRepository.repository.value}/query/new`],
        {queryParams: {'widget': JSON.stringify(this.widget), dashboard: this.dashboardId}});
  }
}
