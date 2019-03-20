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
    'buttonToggle'|'datepicker'|'grouperState'|'input'|'sorterState'|'viewerState';

export interface BaseConfigOption {
  id: string;
  label: string;
  type: ConfigOptionType;
  initialValue?: any;
}

export interface InputConfigOption extends BaseConfigOption {
  inputType?: 'text'|'number';
}

export interface ButtonToggleConfigOption extends BaseConfigOption {
  options?: {id: string, label: string}[];
}

export type ConfigOption = BaseConfigOption&InputConfigOption&ButtonToggleConfigOption;

export const DisplayTypeOptionConfigs: {[key in DisplayType]: (o?: any) => ConfigOption[]} = {
  count: getCountConfigOptions,
  list: getListConfigOptions,
  pie: getPieChartConfigOptions,
  timeSeries: getTimeSeriesConfigOptions,
};

@Component({
  selector: 'widget-type-options',
  templateUrl: 'widget-type-options.html',
  styleUrls: ['widget-type-options.scss', '../edit-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetTypeOptions {
  groupIds: any[] = [];
  sortIds: any[] = [];
  viewLabels: any[] = [];

  configOptions: ConfigOption[];

  formGroup: FormGroup;

  @Input() type: DisplayType;

  @Input() options: WidgetDisplayTypeOptions;

  @Input() itemGroupsDataSource: ItemGroupsDataSource<any>;

  @Input() itemViewer: ItemViewer<any>;

  @Output() optionsChanged = new EventEmitter<WidgetDisplayTypeOptions>();

  private valueChangeSubscription: Subscription;

  private destroyed = new Subject();

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['type'] && this.type) {
      this.setupForm();
    }

    if (simpleChanges['itemGroupsDataSource'] && this.itemGroupsDataSource) {
      this.groupIds = this.itemGroupsDataSource.grouper.getGroups().map(value => value.id);
      this.sortIds = this.itemGroupsDataSource.sorter.getSorts().map(value => value.id);
      this.viewLabels = this.itemViewer.getViews().map(value => value.label);
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

    this.configOptions = DisplayTypeOptionConfigs[this.type]();

    const controls: any = {};
    this.configOptions.forEach(c => {
      controls[c.id] = new FormControl(c.initialValue);
    });

    this.formGroup = new FormGroup(controls);
    this.valueChangeSubscription =
        this.formGroup.valueChanges.pipe(takeUntil(this.destroyed)).subscribe(value => {
          return this.optionsChanged.emit(value);
        });
  }

  setViewerStateFormValues(configOptionId: string, viewLabels: string[]) {
    console.log(configOptionId, viewLabels);
  }
};
