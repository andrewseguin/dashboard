import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {
  GroupIds,
  Groups,
  ItemRendererOptions
} from 'app/package/items-renderer/item-renderer-options';
import {ItemsRenderer} from 'app/package/items-renderer/items-renderer';
import {Item, ItemType} from 'app/repository/services/dao';
import {Dao} from 'app/repository/services/dao/dao';
import {
  DisplayType,
  ItemCountDisplayTypeOptions,
  ItemListDisplayTypeOptions,
  PieChartDisplayTypeOptions,
  TimeSeriesDisplayTypeOptions,
  Widget,
  WidgetDisplayTypeOptions
} from 'app/repository/services/dao/dashboard';
import {Query} from 'app/repository/services/dao/query';
import {Recommendation} from 'app/repository/services/dao/recommendation';
import {ItemRecommendations} from 'app/repository/services/item-recommendations';
import {getItemsFilterer} from 'app/repository/utility/items-renderer/get-items-filterer';
import {getItemsGrouper} from 'app/repository/utility/items-renderer/get-items-grouper';
import {MyItemSorter} from 'app/repository/utility/items-renderer/item-sorter';
import {ItemsFilterMetadata} from 'app/repository/utility/items-renderer/items-filter-metadata';
import {Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';

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

  form = new FormGroup({
    title: new FormControl(),
    itemType: new FormControl(),
    displayType: new FormControl(),
  });

  displayTypeOptions: FormGroup;

  metadata = ItemsFilterMetadata;

  issueQueries =
      this.dao.queries.list.pipe(map(queries => queries.filter(q => q.type === 'issue')));
  prQueries = this.dao.queries.list.pipe(map(queries => queries.filter(q => q.type === 'pr')));

  groups = Groups;
  groupIds = [...GroupIds];

  private _destroyed = new Subject();

  constructor(
      private dialogRef: MatDialogRef<EditWidget, Widget>,
      public itemsRenderer: ItemsRenderer<Item>, private dao: Dao,
      private itemRecommendations: ItemRecommendations,

      @Inject(MAT_DIALOG_DATA) public data: EditWidgetData) {
    this.groupIds.splice(this.groupIds.indexOf('all'), 1);

    this.widget = {...data.widget};

    this.form.get('displayType')!.valueChanges.pipe(takeUntil(this._destroyed))
        .subscribe(displayType => {
          this.updateDisplayTypeOptionsForm(displayType);
        });


    this.itemsRenderer.options.setState(this.widget.options);
    this.form.get('itemType')!.valueChanges.pipe(takeUntil(this._destroyed)).subscribe(itemType => {
      this.changeItemsRendererItemType(itemType);
    });

    this.form.setValue({
      title: this.widget.title,
      itemType: this.widget.itemType,
      displayType: this.widget.displayType,
    });
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  edit() {
    this.dialogRef.close({
      title: this.form.value.title,
      options: this.itemsRenderer.options.getState(),
      itemType: this.form.value.itemType,
      displayType: this.form.value.displayType,
      displayTypeOptions: this.displayTypeOptions.value
    } as Widget);
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

  private changeItemsRendererItemType(itemType: ItemType) {
    const items = this.dao.items.list.pipe(map(items => {
      const issues = items.filter(item => !item.pr);
      const pullRequests = items.filter(item => !!item.pr);
      return itemType === 'issue' ? issues : pullRequests;
    }));

    this.itemsRenderer.initialize(
        items, getItemsFilterer(this.itemRecommendations, this.dao.labels),
        getItemsGrouper(this.dao.labels), new MyItemSorter());
  }

  private updateDisplayTypeOptionsForm(displayType: DisplayType) {
    let options: WidgetDisplayTypeOptions;
    switch (displayType) {
      case 'count':
        options = this.widget.displayTypeOptions as ItemCountDisplayTypeOptions;
        this.displayTypeOptions =
            new FormGroup({fontSize: new FormControl(options.fontSize || 'normal')});
        break;

      case 'list':
        options = this.widget.displayTypeOptions as ItemListDisplayTypeOptions;
        this.displayTypeOptions =
            new FormGroup({listLength: new FormControl(options.listLength || 'normal')});
        break;

      case 'pie':
        options = this.widget.displayTypeOptions as PieChartDisplayTypeOptions;
        this.displayTypeOptions = new FormGroup({
          group: new FormControl(options.group || 'label'),
          filteredGroups: new FormControl(options.filteredGroups || '')
        });
        break;

      case 'time-series':
        options = this.widget.displayTypeOptions as TimeSeriesDisplayTypeOptions;
        this.displayTypeOptions = new FormGroup({
          start: new FormControl(options.start),
          end: new FormControl(options.end),
          group: new FormControl(options.group || 'week'),
          datasets: new FormControl(options.datasets || 'open')
        });
        break;
    }
  }
}
