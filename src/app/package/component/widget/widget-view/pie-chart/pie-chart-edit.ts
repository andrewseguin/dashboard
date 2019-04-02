import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {ItemFilterer} from 'app/package/items-renderer/filterer';
import {ItemGrouper} from 'app/package/items-renderer/grouper';
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

  grouper: ItemGrouper<any, any, any>;
  filterer: ItemFilterer<any, any, any>;

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
    const datasource = data.dataSources.get(initialDataSourceType)!.factory();
    this.grouper = datasource.grouper;
    this.filterer = datasource.filterer;

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
