import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {Router} from '@angular/router';
import {ItemsRenderer} from 'app/package/items-renderer/items-renderer';
import {ActivatedRepository} from 'app/repository/services/activated-repository';
import {Item, ItemsDao, LabelsDao} from 'app/repository/services/dao';
import {Widget} from 'app/repository/services/dao/dashboards-dao';
import {ItemRecommendations} from 'app/repository/services/item-recommendations';
import {getItemsFilterer} from 'app/repository/utility/items-renderer/get-items-filterer';
import {getItemsGrouper} from 'app/repository/utility/items-renderer/get-items-grouper';
import {MyItemSorter} from 'app/repository/utility/items-renderer/item-sorter';
import {filter, map} from 'rxjs/operators';

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
        items, getItemsFilterer(this.itemRecommendations, this.labelsDao),
        getItemsGrouper(this.labelsDao), new MyItemSorter());
  }

  openQuery() {
    this.router.navigate(
        [`${this.activatedRepository.repository.value}/query/new`],
        {queryParams: {'widget': JSON.stringify(this.widget), dashboard: this.dashboardId}});
  }
}
