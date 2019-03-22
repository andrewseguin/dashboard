import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ItemGroupsDataSource} from 'app/package/items-renderer/item-groups-data-source';
import {ActiveStore} from 'app/repository/services/active-repo';
import {Query} from 'app/repository/services/dao/config/query';
import {Recommendation} from 'app/repository/services/dao/config/recommendation';
import {getItemsList} from 'app/repository/services/github-item-groups-data-source';
import {Subject} from 'rxjs';
import {map, mergeMap, takeUntil} from 'rxjs/operators';

import {Widget, WidgetDisplayTypeOptions} from '../dashboard';


export interface EditWidgetData {
  widget: Widget;
  dataSource: ItemGroupsDataSource<any>;
}

@Component({
  templateUrl: 'edit-widget.html',
  styleUrls: ['edit-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditWidget<S, V, G> {
  queryChanged = new Subject<void>();

  form = new FormGroup({
    title: new FormControl(''),
    itemType: new FormControl('issue'),
    displayType: new FormControl('count'),
  });

  recommendationsList =
      this.activeRepo.config.pipe(mergeMap(configStore => configStore.recommendations.list));

  recommendations =
      this.activeRepo.config.pipe(mergeMap(configStore => configStore.recommendations.list));

  issueQueries = this.activeRepo.config.pipe(
      mergeMap(store => store.queries.list),
      map(queries => queries.filter(q => q.type === 'issue')));
  prQueries = this.activeRepo.config.pipe(
      mergeMap(store => store.queries.list), map(queries => queries.filter(q => q.type === 'pr')));

  public itemGroupsDataSource: ItemGroupsDataSource<any>;

  groups = this.itemGroupsDataSource.grouper.metadata;
  groupIds: G[];

  private _destroyed = new Subject();

  displayTypes = [
    {id: 'count', label: 'Count'},
    {id: 'list', label: 'List'},
    {id: 'pie', label: 'Pie Chart'},
    {id: 'timeSeries', label: 'Time Series'},
  ];

  itemCount = this.itemGroupsDataSource.connect().pipe(map(result => result.count));

  displayTypeOptions: WidgetDisplayTypeOptions;

  constructor(
      private activeRepo: ActiveStore, private cd: ChangeDetectorRef,
      private dialogRef: MatDialogRef<EditWidget<S, V, G>, Widget>,
      @Inject(MAT_DIALOG_DATA) public data: EditWidgetData) {
    this.itemGroupsDataSource = data.dataSource;

    if (data && data.widget) {
      this.form.setValue({
        title: data.widget.title,
        itemType: data.widget.itemType,
        displayType: data.widget.displayType,
      });

      this.displayTypeOptions = data.widget.displayTypeOptions;

      this.itemGroupsDataSource.dataProvider =
          getItemsList(this.activeRepo.activeData, data.widget.itemType);

      this.itemGroupsDataSource.filterer.setState(data.widget.filtererState);
    }

    this.itemGroupsDataSource.dataProvider = getItemsList(this.activeRepo.activeData, 'issue');
    this.form.get('itemType')!.valueChanges.pipe(takeUntil(this._destroyed)).subscribe(type => {
      this.itemGroupsDataSource.dataProvider = getItemsList(this.activeRepo.activeData, type);
      this.cd.markForCheck();
    });
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  edit() {
    const widget: Widget = {
      title: this.form.value.title,
      itemType: this.form.value.itemType,
      filtererState: this.itemGroupsDataSource.filterer.getState(),
      displayType: this.form.value.displayType,
      displayTypeOptions: this.displayTypeOptions
    };

    this.dialogRef.close(widget);
  }

  loadFromQuery(query: Query) {
    if (query.filtererState) {
      this.itemGroupsDataSource.filterer.setState(query.filtererState);
    }
  }

  loadFromRecommendation(recommendation: Recommendation) {
    if (recommendation.filtererState) {
      this.itemGroupsDataSource.filterer.setState(recommendation.filtererState);
    }
  }
}
