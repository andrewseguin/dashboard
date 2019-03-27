import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {ItemFilterer} from 'app/package/items-renderer/item-filterer';
import {take} from 'rxjs/operators';

import {ButtonToggleOption} from '../../edit-widget/button-toggle-option/button-toggle-option';
import {EDIT_WIDGET_DATA, EditWidgetData2} from '../../widget';

import {TimeSeriesDisplayTypeOptions} from './time-series';
import { SavedFiltererState } from '../../edit-widget/edit-widget';


@Component({
  template: `
    <ng-container [formGroup]="form">
      <button-toggle-group-option formControlName="dataSourceType" label="Data"
                                  [options]="dataOptions">
      </button-toggle-group-option>
      <date-option formControlName="start" label="Start date"></date-option>
      <date-option formControlName="end" label="End date"></date-option>
      <button-toggle-group-option formControlName="group" label="Group"
                                  [options]="groupOptions">
      </button-toggle-group-option>
      <button-toggle-group-option formControlName="datasets" label="Datasets" multiple="true"
                                  [options]="datasetOptions">
      </button-toggle-group-option>
      <filter-state-option formControlName="filtererState" [filterer]="filterer" [savedFiltererStates]="savedFiltererStates"></filter-state-option>
    </ng-container>
  `,
  styleUrls: ['../../edit-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeSeriesEdit {
  filterer: ItemFilterer<any, any, any>;

  dataOptions: ButtonToggleOption[] = [];

  datasetOptions = [
    {id: 'created', label: 'Created'},
    {id: 'closed', label: 'Closed'},
    {id: 'open', label: 'Open'},
  ];

  groupOptions = [
    {id: 'day', label: 'Day'},
    {id: 'week', label: 'Week'},
    {id: 'month', label: 'Month'},
  ];

  form = new FormGroup({
    dataSourceType: new FormControl(null),
    start: new FormControl(null),
    end: new FormControl(null),
    group: new FormControl('week'),
    datasets: new FormControl(['open']),
    filtererState: new FormControl(null),
  });

  savedFiltererStates: SavedFiltererState[];

  constructor(@Inject(EDIT_WIDGET_DATA) public data:
                  EditWidgetData2<TimeSeriesDisplayTypeOptions>) {
    // TODO: Filter based on datasource type
    this.savedFiltererStates = data.savedFiltererStates;
    this.data.dataSources.forEach(
        dataSource => this.dataOptions.push({id: dataSource.id, label: dataSource.label}));
    const initialDataSourceType = this.dataOptions[0].id;
    this.form.get('dataSourceType')!.setValue(initialDataSourceType);

    const datasource = data.dataSources.get(initialDataSourceType)!.factory();
    this.filterer = datasource.filterer;

    data.options.pipe(take(1)).subscribe(value => {
      if (value) {
        if (value.dataSourceType) {
          this.form.get('dataSourceType')!.setValue(value.dataSourceType);
        }
        if (value.start) {
          this.form.get('start')!.setValue(value.start);
        }
        if (value.end) {
          this.form.get('end')!.setValue(value.end);
        }
        if (value.group) {
          this.form.get('group')!.setValue(value.group);
        }
        if (value.datasets) {
          this.form.get('datasets')!.setValue(value.datasets);
        }
        if (value.filtererState) {
          this.form.get('filtererState')!.setValue(value.filtererState);
        }
      }
    });
    this.form.valueChanges.subscribe(value => {
      data.options.next(value);
    });
  }
}
