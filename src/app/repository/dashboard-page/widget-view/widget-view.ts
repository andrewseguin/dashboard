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
import {Item, LabelsDao} from 'app/repository/services/dao';
import {Widget} from 'app/repository/services/dao/dashboards-dao';
import {RepoDao} from 'app/repository/services/dao/repo-dao';
import {ItemRecommendations} from 'app/repository/services/item-recommendations';
import {ItemFilterer} from 'app/repository/services/items-renderer/item-filterer';
import {ItemGrouping} from 'app/repository/services/items-renderer/item-grouping';
import {ItemsFilterMetadata} from 'app/repository/services/items-renderer/items-filter-metadata';
import {ItemsRenderer} from 'app/repository/services/items-renderer/items-renderer';
import {ItemDetailDialog} from 'app/repository/shared/dialog/item-detail-dialog/item-detail-dialog';
import {MatcherContext} from 'app/repository/utility/search/filter';
import {tokenizeItem} from 'app/repository/utility/tokenize-item';
import {combineLatest, Subject} from 'rxjs';
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

  trackByNumber = (_i, item: Item) => item.number;

  private destroyed = new Subject();

  constructor(
      public itemsRenderer: ItemsRenderer, private dialog: MatDialog, private cd: ChangeDetectorRef,
      private repoDao: RepoDao, private router: Router,
      private itemRecommendations: ItemRecommendations, private labelsDao: LabelsDao,
      private activatedRepository: ActivatedRepository) {}

  ngOnInit() {
    const items = this.repoDao.repo.pipe(
        filter(repo => !!repo), map(repo => {
          return this.widget.itemType === 'issue' ? repo.issues : repo.pullRequests;
        }));


    const filterer = combineLatest(this.itemRecommendations.recommendations, this.labelsDao.map)
                         .pipe(filter(result => !!result[0] && !!result[1]), map(result => {
                                 const recommendationsByItem = result[0];
                                 const labelsMap = result[1];
                                 const contextProvider = (item: Item) => {
                                   return {
                                     item,
                                     labelsMap,
                                     recommendations: recommendationsByItem.get(item.id),
                                   };
                                 };
                                 return new ItemFilterer<Item, MatcherContext>(
                                     contextProvider, tokenizeItem, ItemsFilterMetadata);
                               }));


    this.itemsRenderer.initialize(items, filterer, new ItemGrouping());
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

  openItemModal(itemId: string) {
    this.dialog.open(ItemDetailDialog, {data: {itemId}});
  }

  openQuery() {
    this.router.navigate(
        [`${this.activatedRepository.repository.value}/query/new`],
        {queryParams: {'widget': JSON.stringify(this.widget), dashboard: this.dashboardId}});
  }
}
