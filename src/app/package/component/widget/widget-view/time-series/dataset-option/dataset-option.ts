import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {ControlContainer, FormArray} from '@angular/forms';
import {Filterer} from 'app/package/data-source/filterer';
import {Provider} from 'app/package/data-source/provider';
import {DataSourceProvider} from 'app/package/utility/data-source-provider';
import {Subject} from 'rxjs';
import {startWith, takeUntil} from 'rxjs/operators';
import {ButtonToggleOption} from '../../../edit-widget/button-toggle-option/button-toggle-option';
import {SavedFiltererState} from '../../../edit-widget/edit-widget';

@Component({
  selector: 'dataset-option',
  templateUrl: 'dataset-option.html',
  styleUrls: ['dataset-option.scss', '../../../edit-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasetOption {
  dataSourceTypeOptions: ButtonToggleOption[] = [];

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

  filterer: Filterer<any, any>;

  provider: Provider<any>;

  private destroyed = new Subject();

  @Input() savedFiltererStates: SavedFiltererState[];

  @Input() dataSources: Map<string, DataSourceProvider>;

  @Output() remove = new EventEmitter();

  @Output() duplicate = new EventEmitter();

  @Output() addAction = new EventEmitter();

  constructor(public controlContainer: ControlContainer) {}

  ngOnInit() {
    this.dataSources.forEach(
        dataSource =>
            this.dataSourceTypeOptions.push({id: dataSource.id, label: dataSource.label}));

    const dataSourceTypeControl = this.controlContainer.control!.get('dataSourceType')!;
    if (!dataSourceTypeControl.value) {
      dataSourceTypeControl.setValue(this.dataSourceTypeOptions[0].id);
    }

    dataSourceTypeControl.valueChanges
        .pipe(takeUntil(this.destroyed), startWith(dataSourceTypeControl.value))
        .subscribe(value => {
          const dataSourceProvider = this.dataSources.get(value)!;
          this.provider = dataSourceProvider.provider();
          this.filterer = dataSourceProvider.filterer();
        });
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
