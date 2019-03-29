import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {ControlContainer, FormArray} from '@angular/forms';
import {DataSourceProvider} from 'app/package/items-renderer/data-source-provider';
import {ItemFilterer} from 'app/package/items-renderer/item-filterer';
import {Subject} from 'rxjs';
import {ButtonToggleOption} from '../../../edit-widget/button-toggle-option/button-toggle-option';
import {SavedFiltererState} from '../../../edit-widget/edit-widget';

@Component({
  selector: 'dataset-option',
  templateUrl: 'dataset-option.html',
  styleUrls: ['dataset-option.scss', '../../../edit-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasetOption {
  dataOptions: ButtonToggleOption[] = [];

  // TODO: Should be determined by data source
  datePropertyIdOptions: ButtonToggleOption[] = [
    {id: 'opened', label: 'Opened'},
    {id: 'closed', label: 'Closed'},
  ];

  seriesTypeOptions: ButtonToggleOption[] = [
    {id: 'count', label: 'Count'},
    {id: 'accumulate', label: 'Accumulate'},
  ];

  actionTypeOptions: ButtonToggleOption[] = [
    {id: 'increment', label: 'Increment'},
    {id: 'decrement', label: 'Decrement'},
  ];

  filterer: ItemFilterer<any, any, any>;

  private destroyed = new Subject();

  @Input() savedFiltererStates: SavedFiltererState[];

  @Input() dataSources: Map<string, DataSourceProvider>;

  @Output() remove = new EventEmitter();

  @Output() addAction = new EventEmitter();

  constructor(public controlContainer: ControlContainer) {}

  ngOnInit() {
    this.dataSources.forEach(
        dataSource => this.dataOptions.push({id: dataSource.id, label: dataSource.label}));
    const initialDataSourceType = this.dataOptions[0].id;
    this.controlContainer.control!.get('dataSourceType')!.setValue(initialDataSourceType);

    const datasource = this.dataSources.get(initialDataSourceType)!.factory();
    this.filterer = datasource.filterer;
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  removeAction(index: number) {
    const actionsFormArray = this.controlContainer.control!.get('actions') as FormArray;
    actionsFormArray.removeAt(index);
  }
}
