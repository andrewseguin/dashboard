import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {take} from 'rxjs/operators';

import {ButtonToggleOption} from '../../edit-widget/button-toggle-option/button-toggle-option';
import {EDIT_WIDGET_DATA, EditWidgetData2} from '../../widget';

import {TimeSeriesDisplayTypeOptions} from './time-series';


@Component({
  selector: 'time-series-edit',
  templateUrl: 'time-series-edit.html',
  styleUrls: ['time-series-edit.scss', '../../edit-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeSeriesEdit {
  groupOptions: ButtonToggleOption[] = [
    {id: 'day', label: 'Day'},
    {id: 'week', label: 'Week'},
    {id: 'month', label: 'Month'},
  ];

  form = new FormGroup({
    dataSourceType: new FormControl(null),
    start: new FormControl(null),
    end: new FormControl(null),
    group: new FormControl('week'),
    datasets: new FormArray([]),
  });

  constructor(@Inject(EDIT_WIDGET_DATA) public data:
                  EditWidgetData2<TimeSeriesDisplayTypeOptions>) {
    data.options.pipe(take(1)).subscribe(value => this.initializeForm(value));
    this.form.valueChanges.subscribe(value => data.options.next(value));
  }

  removeDataset(index: number) {
    const datasetsFormArray = this.form.get('datasets') as FormArray;
    datasetsFormArray.removeAt(index);
  }

  addDataset() {
    const newDataset = this.createSeries();
    const datasetsFormArray = this.form.get('datasets') as FormArray;
    datasetsFormArray.push(newDataset);
    this.addAction(newDataset);
    return newDataset;
  }

  addAction(dataset: FormGroup) {
    (dataset.get('actions') as FormArray).push(new FormGroup({
      datePropertyId: new FormControl(),
      type: new FormControl(),
    }));
  }

  private initializeForm(value: TimeSeriesDisplayTypeOptions) {
    const datasetsFormArray = this.form.get('datasets') as FormArray;
    value.datasets.forEach(dataset => {
      const datasetFormGroup = this.createSeries();
      dataset.actions.forEach(() => {
        this.addAction(datasetFormGroup);
      });
      datasetsFormArray.push(datasetFormGroup);
    });

    this.form.setValue(value);
  }

  private createSeries() {
    return new FormGroup({
      label: new FormControl('New Series'),
      color: new FormControl(''),
      seriesType: new FormControl('count'),
      actions: new FormArray([]),
      dataSourceType: new FormControl(''),
      filtererState: new FormControl(null),
    });
  }
}
