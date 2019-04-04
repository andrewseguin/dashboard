import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Filterer} from 'app/package/data-source/filterer';
import {Grouper} from 'app/package/data-source/grouper';
import {Provider} from 'app/package/data-source/provider';
import {take} from 'rxjs/operators';

import {ButtonToggleOption} from '../../edit-widget/button-toggle-option/button-toggle-option';
import {SavedFiltererState} from '../../edit-widget/edit-widget';
import {EDIT_WIDGET_DATA, EditWidgetData2} from '../../widget';

import {PieChartDisplayTypeOptions} from './pie-chart';


@Component({
  templateUrl: 'pie-chart-edit.html',
  styleUrls: ['../../edit-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieChartEdit {
  dataOptions: ButtonToggleOption[] = [];

  grouper: Grouper<any, any, any>;
  filterer: Filterer<any, any>;
  provider: Provider<any>;

  form = new FormGroup({
    dataSourceType: new FormControl(null),
    grouperState: new FormControl(null),
    filteredGroups: new FormControl(null),
    filtererState: new FormControl(null),
  });

  savedFiltererStates: SavedFiltererState[];

  constructor(@Inject(EDIT_WIDGET_DATA) public data:
                  EditWidgetData2<PieChartDisplayTypeOptions<any>>) {
    // TODO: Filter based on datasource type
    this.savedFiltererStates = data.savedFiltererStates;
    this.data.dataSources.forEach(
        dataSource => this.dataOptions.push({id: dataSource.id, label: dataSource.label}));
    const initialDataSourceType = this.dataOptions[0].id;
    this.form.get('dataSourceType')!.setValue(initialDataSourceType);

    // TODO: Add in a datasource type selector
    const dataSourceProvider = data.dataSources.get(initialDataSourceType)!;
    this.grouper = dataSourceProvider.grouper();
    this.filterer = dataSourceProvider.filterer();
    this.provider = dataSourceProvider.provider();

    data.options.pipe(take(1)).subscribe(value => {
      if (value) {
        if (value.dataSourceType) {
          this.form.get('dataSourceType')!.setValue(value.dataSourceType);
        }
        if (value.grouperState) {
          this.form.get('grouperState')!.setValue(value.grouperState);
        }
        if (value.filteredGroups) {
          this.form.get('filteredGroups')!.setValue(value.filteredGroups);
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
