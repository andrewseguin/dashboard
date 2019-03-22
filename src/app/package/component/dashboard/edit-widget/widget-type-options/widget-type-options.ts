import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges
} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {ItemGrouperState} from 'app/package/items-renderer/item-grouper';
import {ItemGroupsDataSource} from 'app/package/items-renderer/item-groups-data-source';
import {ItemSorterState} from 'app/package/items-renderer/item-sorter';
import {ItemViewerState} from 'app/package/items-renderer/item-viewer';
import {Subject, Subscription} from 'rxjs';
import {startWith, takeUntil} from 'rxjs/operators';
import {WidgetDisplayTypeOptions} from '../../dashboard';

export type ConfigOptionType =
    'buttonToggle'|'datepicker'|'grouperState'|'input'|'sorterState'|'viewerState';

export interface BaseWidgetDataOption {
  id: string;
  label: string;
  type: ConfigOptionType;
  initialValue?: any;
}

export interface InputWidgetDataOption extends BaseWidgetDataOption {
  inputType?: 'text'|'number';
  placeholder?: string;
}

export interface ButtonToggleWidgetDataOption extends BaseWidgetDataOption {
  options?: {id: string, label: string}[];
}

export type WidgetDataOption =
    BaseWidgetDataOption&InputWidgetDataOption&ButtonToggleWidgetDataOption;

export type WidgetDataOptionsProvider = (o: any) => WidgetDataOption[];

@Component({
  selector: 'widget-type-options',
  templateUrl: 'widget-type-options.html',
  styleUrls: ['widget-type-options.scss', '../edit-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetTypeOptions<G, S, V> {
  groupIds: G[] = [];
  sortIds: S[] = [];
  viewLabels: string[] = [];

  widgetDataOptions: WidgetDataOption[];

  formGroup: FormGroup;

  @Input() optionsProvider: WidgetDataOptionsProvider;

  @Input() options: WidgetDisplayTypeOptions;

  @Input() itemGroupsDataSource: ItemGroupsDataSource<any>;

  @Output() optionsChanged = new EventEmitter<WidgetDisplayTypeOptions>();

  private valueChangeSubscription: Subscription;

  private destroyed = new Subject();

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['itemGroupsDataSource'] && this.itemGroupsDataSource) {
      this.groupIds = this.itemGroupsDataSource.grouper.getGroups().map(value => value.id);
      this.sortIds = this.itemGroupsDataSource.sorter.getSorts().map(value => value.id);
      this.viewLabels = this.itemGroupsDataSource.viewer.getViews().map(value => value.label);
    }
    if (simpleChanges['optionsProvider'] && this.optionsProvider) {
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

    this.widgetDataOptions = this.optionsProvider(this.options);

    const controls: any = {};
    this.widgetDataOptions.forEach(c => {
      const initialValue = c.initialValue || this.getDefaultInitialValue(c.type);
      controls[c.id] = new FormControl(initialValue);
    });

    this.formGroup = new FormGroup(controls);
    this.valueChangeSubscription =
        this.formGroup.valueChanges.pipe(startWith(null), takeUntil(this.destroyed))
            .subscribe(() => this.optionsChanged.emit(this.formGroup.value));
  }

  setViewerStateFormValues(configOptionId: string, views: string[]) {
    this.formGroup.get(configOptionId)!.setValue({views});
  }

  setGrouperStateFormValue(configOptionId: string, group: any) {
    this.formGroup.get(configOptionId)!.setValue({group});
  }

  setSorterStateFormValue(configOptionId: string, sortId: any, reverse: boolean) {
    this.formGroup.get(configOptionId)!.setValue({sort: sortId, reverse});
  }

  getDefaultInitialValue(configOptionType: ConfigOptionType) {
    switch (configOptionType) {
      case 'grouperState':
        return {group: this.groupIds[0]} as ItemGrouperState<any>;
      case 'sorterState':
        return {sort: this.sortIds[0], reverse: false} as ItemSorterState<S>;
      case 'viewerState':
        const views = this.itemGroupsDataSource.viewer.getViews().map(v => v.id);
        return {views} as ItemViewerState<V>;
      default:
        return '';
    }
  }
}
