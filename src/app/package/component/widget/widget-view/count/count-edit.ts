import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Filterer} from 'app/package/items-renderer/filterer';
import {take} from 'rxjs/operators';

import {ButtonToggleOption} from '../../edit-widget/button-toggle-option/button-toggle-option';
import {SavedFiltererState} from '../../edit-widget/edit-widget';
import {EDIT_WIDGET_DATA, EditWidgetData2} from '../../widget';

import {CountDisplayTypeOptions} from './count.module';

@Component({
  templateUrl: 'count-edit.html',
  styleUrls: ['../../edit-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCount {
  dataOptions: ButtonToggleOption[] = [];

  filterer: Filterer<any, any, any>;

  form = new FormGroup({
    dataSourceType: new FormControl(null),
    fontSize: new FormControl(48),
    filtererState: new FormControl(null),
  });

  savedFiltererStates: SavedFiltererState[];

  constructor(@Inject(EDIT_WIDGET_DATA) public data: EditWidgetData2<CountDisplayTypeOptions>) {
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
        if (value.fontSize) {
          this.form.get('fontSize')!.setValue(value.fontSize);
        }
        if (value.filtererState) {
          this.form.get('filtererState')!.setValue(value.filtererState);
        }
      }
    });

    this.form.valueChanges.subscribe(value => {
      if (value) {
        data.options.next(value);
      }
    });
  }
}
