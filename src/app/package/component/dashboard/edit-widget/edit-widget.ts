import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ItemGroupsDataSource} from 'app/package/items-renderer/item-groups-data-source';
import {ActiveStore} from 'app/repository/services/active-repo';
import {combineLatest, ReplaySubject, Subject} from 'rxjs';
import {filter, map, mergeMap, take, takeUntil} from 'rxjs/operators';

import {Widget, WidgetDisplayTypeOptions} from '../dashboard';
import {WidgetConfig} from '../dashboard-view';
import {DataSource} from '../widget-view/widget-view';


export interface EditWidgetData {
  widget: Widget;
  dataSources: Map<string, DataSource>;
  widgetConfigs: {[key in string]: WidgetConfig};
}

@Component({
  templateUrl: 'edit-widget.html',
  styleUrls: ['edit-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditWidget<S, V, G> {
  form = new FormGroup({
    title: new FormControl(''),
    displayType: new FormControl('count'),
  });

  dataSourceType = new ReplaySubject<string>();

  recommendationsList =
      this.activeRepo.config.pipe(mergeMap(configStore => configStore.recommendations.list));

  recommendations =
      this.activeRepo.config.pipe(mergeMap(configStore => configStore.recommendations.list));

  issueQueries = this.activeRepo.config.pipe(
      mergeMap(store => store.queries.list),
      map(queries => queries.filter(q => q.dataSourceType === 'issue')));
  prQueries = this.activeRepo.config.pipe(
      mergeMap(store => store.queries.list),
      map(queries => queries.filter(q => q.dataSourceType === 'pr')));

  itemGroupsDataSource = new ReplaySubject<ItemGroupsDataSource<any>>();

  itemCount = this.itemGroupsDataSource.pipe(
      mergeMap(dataSource => dataSource.connect().pipe(map(result => result.count))));

  private destroyed = new Subject();

  widgetConfigs: WidgetConfig[] = [];

  displayTypeOptions: WidgetDisplayTypeOptions;

  constructor(
      private activeRepo: ActiveStore, private dialogRef: MatDialogRef<EditWidget<S, V, G>, Widget>,
      @Inject(MAT_DIALOG_DATA) public data: EditWidgetData) {
    for (let id of Object.keys(data.widgetConfigs)) {
      this.widgetConfigs.push(data.widgetConfigs[id]);
    }

    // TODO: Figure out how to multicast and publish rather than doing this
    this.dataSourceType
        .pipe(
            map(type => this.data.dataSources.get(type)), filter(v => !!v),
            takeUntil(this.destroyed))
        .subscribe(dataSource => {
          this.itemGroupsDataSource.next(dataSource!.factory());
        });
  }

  ngOnInit() {
    if (this.data && this.data.widget) {
      this.dataSourceType.next('issue');
      this.form.setValue({
        title: this.data.widget.title || '',
        displayType: this.data.widget.displayType || 'count',
      });

      if (this.data.widget.displayTypeOptions) {
        this.displayTypeOptions = this.data.widget.displayTypeOptions;
      }

      this.itemGroupsDataSource.pipe(take(1)).subscribe(itemGroupsDataSource => {
        if (this.data.widget.filtererState) {
          itemGroupsDataSource.filterer.setState(this.data.widget.filtererState);
        }
      });
    }
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  edit() {
    combineLatest(this.itemGroupsDataSource, this.dataSourceType)
        .pipe(take(1))
        .subscribe(results => {
          const widget: Widget = {
            title: this.form.value.title,
            dataSourceType: results[1],
            filtererState: results[0].filterer.getState(),
            displayType: this.form.value.displayType,
            displayTypeOptions: this.displayTypeOptions
          };

          this.dialogRef.close(widget);
        });
  }
}
