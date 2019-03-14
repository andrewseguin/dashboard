import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Group, ItemRendererOptions} from 'app/package/items-renderer/item-renderer-options';
import {ItemsRenderer} from 'app/package/items-renderer/items-renderer';
import {Item, ItemsDao, ItemType, LabelsDao} from 'app/repository/services/dao';
import {Widget} from 'app/repository/services/dao/dashboards-dao';
import {QueriesDao, Query} from 'app/repository/services/dao/queries-dao';
import {Recommendation, RecommendationsDao} from 'app/repository/services/dao/recommendations-dao';
import {ItemRecommendations} from 'app/repository/services/item-recommendations';
import {getItemsFilterer} from 'app/repository/utility/items-renderer/get-items-filterer';
import {getItemsGrouper} from 'app/repository/utility/items-renderer/get-items-grouper';
import {MyItemSorter} from 'app/repository/utility/items-renderer/item-sorter';
import {ItemsFilterMetadata} from 'app/repository/utility/items-renderer/items-filter-metadata';
import {Subject} from 'rxjs';
import {filter, map, takeUntil} from 'rxjs/operators';

export interface EditWidgetData {
  widget: Widget;
}

@Component({
  templateUrl: 'edit-widget.html',
  styleUrls: ['edit-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ItemsRenderer]
})
export class EditWidget {
  widget: Widget;

  queryChanged = new Subject<void>();

  form: FormGroup;

  metadata = ItemsFilterMetadata;

  issueQueries = this.queriesDao.list.pipe(
      filter(v => !!v), map(queries => queries!.filter(q => q.type === 'issue')));
  prQueries = this.queriesDao.list.pipe(
      filter(v => !!v), map(queries => queries!.filter(q => q.type === 'pr')));

  pieChartGroups: Group[] = ['labels', 'reporter'];

  private _destroyed = new Subject();

  constructor(
      private dialogRef: MatDialogRef<EditWidget, Widget>,
      public itemsRenderer: ItemsRenderer<Item>, public recommendationsDao: RecommendationsDao,
      private itemsDao: ItemsDao, private itemRecommendations: ItemRecommendations,
      private labelsDao: LabelsDao, public queriesDao: QueriesDao,
      @Inject(MAT_DIALOG_DATA) public data: EditWidgetData) {
    this.widget = {...data.widget};

    this.initializeItemsRenderer(this.widget.itemType);
    if (data.widget.options) {
      this.itemsRenderer.options.setState(data.widget.options);
    }

    this.form = new FormGroup({
      title: new FormControl(this.widget.title),
      itemType: new FormControl(this.widget.itemType),
      displayType: new FormControl(this.widget.displayType),
      listLength: new FormControl(this.widget.listLength || 3),
      pieChartGroupBy: new FormControl(this.widget.groupBy)
    });

    this.form.get('itemType')!.valueChanges.pipe(takeUntil(this._destroyed)).subscribe(itemType => {
      this.initializeItemsRenderer(itemType);
    });
  }

  private initializeItemsRenderer(itemType: ItemType) {
    const items = this.itemsDao.list.pipe(filter(v => !!v), map(items => {
                                            const issues = items!.filter(item => !item.pr);
                                            const pullRequests = items!.filter(item => !!item.pr);
                                            return itemType === 'issue' ? issues : pullRequests;
                                          }));

    this.itemsRenderer.initialize(
        items, getItemsFilterer(this.itemRecommendations, this.labelsDao),
        getItemsGrouper(this.labelsDao), new MyItemSorter());
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  edit() {
    const result: Widget = {
      title: this.form.value.title,
      options: this.itemsRenderer.options.getState(),
      itemType: this.form.value.itemType,
      displayType: this.form.value.displayType,
    };

    if (result.displayType === 'list') {
      result.listLength = this.form.value.listLength;
    }

    if (result.displayType === 'pie') {
      result.groupBy = this.form.value.pieChartGroupBy;
    }

    this.dialogRef.close(result);
  }

  loadFromRecommendation(recommendation: Recommendation) {
    const options = new ItemRendererOptions();
    options.filters = recommendation.filters || [];
    options.search = recommendation.search || '';
    this.itemsRenderer.options.setState(options.getState());
  }

  loadFromQuery(query: Query) {
    if (query.options) {
      this.itemsRenderer.options.setState(query.options);
    }
  }
}
