import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {Router} from '@angular/router';
import {ItemsRenderer} from 'app/package/items-renderer/items-renderer';
import {Theme} from 'app/repository/services';
import {ActiveRepo} from 'app/repository/services/active-repo';
import {Item} from 'app/repository/services/dao';
import {Dao} from 'app/repository/services/dao/dao';
import {Widget} from 'app/repository/services/dao/dashboard';
import {ItemRecommendations} from 'app/repository/services/item-recommendations';
import {getItemsFilterer} from 'app/repository/utility/items-renderer/get-items-filterer';
import {getItemsGrouper} from 'app/repository/utility/items-renderer/get-items-grouper';
import {MyItemSorter} from 'app/repository/utility/items-renderer/item-sorter';
import * as Chart from 'chart.js';
import {map} from 'rxjs/operators';

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

  @Output() duplicate = new EventEmitter<void>();

  @Output() remove = new EventEmitter<void>();

  constructor(
      public itemsRenderer: ItemsRenderer<Item>, private router: Router,
      private itemRecommendations: ItemRecommendations, private theme: Theme, private dao: Dao,
      private activeRepo: ActiveRepo) {
    Chart.defaults.global.defaultFontColor = this.theme.isLight ? 'black' : 'white';
  }

  ngOnInit() {
    const items = this.dao.items.list.pipe(map(items => {
      const issues = items.filter(item => !item.pr);
      const pullRequests = items.filter(item => !!item.pr);
      return this.widget.itemType === 'issue' ? issues : pullRequests;
    }));

    this.itemsRenderer.initialize(
        items, getItemsFilterer(this.itemRecommendations, this.dao.labels),
        getItemsGrouper(this.dao.labels), new MyItemSorter());
  }

  openQuery() {
    this.router.navigate(
        [`${this.activeRepo.repository}/query/new`],
        {queryParams: {'widget': JSON.stringify(this.widget), dashboard: this.dashboardId}});
  }
}
