import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges
} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {ItemGroupsDataSource} from 'app/package/items-renderer/item-groups-data-source';
import {ItemViewer} from 'app/package/items-renderer/item-viewer';
import {DisplayType, WidgetDisplayTypeOptions} from 'app/repository/services/dao';
import {Subject, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {getCountConfigOptions} from '../../widget-view/count/count';
import {getListConfigOptions} from '../../widget-view/list/list';
import {getPieChartConfigOptions} from '../../widget-view/pie-chart/pie-chart';
import {getTimeSeriesConfigOptions} from '../../widget-view/time-series/time-series';


export type ConfigOptionType =
    'buttonToggle'|'datepicker'|'grouperState'|'input'|'select'|'sorterState'|'viewerState';

export interface BaseConfigOption {
  id: string;
  label: string;
  type: ConfigOptionType;
  initialValue?: any;
}

export interface InputConfigOption extends BaseConfigOption {
  inputType?: 'text'|'number';
}

export interface SelectConfigOption extends BaseConfigOption {
  options?: {id: string, label: string}[];
}

export type ConfigOption = BaseConfigOption&InputConfigOption&SelectConfigOption;

export const DisplayTypeOptionConfigs: {[key in DisplayType]: (o?: any) => ConfigOption[]} = {
  count: getCountConfigOptions,
  list: getListConfigOptions,
  pie: getPieChartConfigOptions,
  timeSeries: getTimeSeriesConfigOptions,
};

@Component({
  selector: 'edit-widget-options',
  templateUrl: 'edit-widget-options.html',
  styleUrls: ['edit-widget-options.scss', '../edit-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditWidgetOptions {
  configOptions: BaseConfigOption[];

  formGroup: FormGroup;

  @Input() displayType: DisplayType;

  @Input() displayTypeOptions: WidgetDisplayTypeOptions;

  @Input() itemGroupsDataSource: ItemGroupsDataSource<any>;

  @Input() itemViewer: ItemViewer<any>;

  @Output() displayTypeOptionsChanged = new EventEmitter<WidgetDisplayTypeOptions>();

  private valueChangeSubscription: Subscription;

  private destroyed = new Subject();

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['displayType'] && this.displayType) {
      this.setupForm();
    }
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  setupForm() {
    if (this.valueChangeSubscription) {
      this.valueChangeSubscription.unsubscribe();
    }

    this.configOptions = DisplayTypeOptionConfigs[this.displayType]();

    const controls: any = {};
    this.configOptions.forEach(c => {
      controls[c.id] = new FormControl(c.initialValue);
    });

    this.formGroup = new FormGroup(controls);
    this.valueChangeSubscription =
        this.formGroup.valueChanges.pipe(takeUntil(this.destroyed)).subscribe(value => {
          return this.displayTypeOptionsChanged.emit(value);
        });
  }
}
