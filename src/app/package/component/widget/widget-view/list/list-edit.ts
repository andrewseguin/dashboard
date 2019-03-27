import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {ItemSorter} from 'app/package/items-renderer/item-sorter';
import {ItemViewer} from 'app/package/items-renderer/item-viewer';
import {take} from 'rxjs/operators';

import {ButtonToggleOption} from '../../edit-widget/button-toggle-option/button-toggle-option';
import {EDIT_WIDGET_DATA, EditWidgetData2} from '../../widget';

import {ListDisplayTypeOptions} from './list';
import { ItemFilterer } from 'app/package/items-renderer/item-filterer';
import { SavedFiltererState } from '../../edit-widget/edit-widget';


@Component({
  template: `
    <ng-container [formGroup]="form">
      <button-toggle-group-option formControlName="dataSourceType" label="Data"
                                  [options]="dataOptions">
      </button-toggle-group-option>
      <input-option formControlName="listLength" label="List length" type="number"></input-option>
      <sort-state-option formControlName="sorterState"
                         label="Sort state" [sorter]="sorter"></sort-state-option>
      <view-state-option formControlName="viewerState"
                         label="Views" [viewer]="viewer"></view-state-option>
      <filter-state-option formControlName="filtererState" [filterer]="filterer" [savedFiltererStates]="savedFiltererStates"></filter-state-option>
    </ng-container>
  `,
  styleUrls: ['../../edit-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListEdit {
  dataOptions: ButtonToggleOption[] = [];

  viewer: ItemViewer<any, any, any>;
  sorter: ItemSorter<any, any, any>;
  filterer: ItemFilterer<any, any, any>;

  form = new FormGroup({
    dataSourceType: new FormControl(null),
    listLength: new FormControl(5),
    sorterState: new FormControl(null),
    viewerState: new FormControl(null),
    filtererState: new FormControl(null),
  });

  savedFiltererStates: SavedFiltererState[];

  constructor(@Inject(EDIT_WIDGET_DATA) public data:
                  EditWidgetData2<ListDisplayTypeOptions<any, any>>) {
                    // TODO: Filter based on datasource type
                    this.savedFiltererStates = data.savedFiltererStates;
    this.data.dataSources.forEach(
        dataSource => this.dataOptions.push({id: dataSource.id, label: dataSource.label}));
    const initialDataSourceType = this.dataOptions[0].id;

    this.form.get('dataSourceType')!.setValue(initialDataSourceType);
    const datasource = data.dataSources.get(initialDataSourceType)!.factory();
    this.sorter = datasource.sorter;
    this.viewer = datasource.viewer;
    this.filterer = datasource.filterer;

    data.options.pipe(take(1)).subscribe(value => {
      if (value) {
        if (value.dataSourceType) {
          this.form.get('dataSourceType')!.setValue(value.dataSourceType);
        }
        if (value.listLength) {
          this.form.get('listLength')!.setValue(value.listLength);
        }
        if (value.sorterState) {
          this.form.get('sorterState')!.setValue(value.sorterState);
        }
        if (value.viewerState) {
          this.form.get('viewerState')!.setValue(value.sorterState);
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
