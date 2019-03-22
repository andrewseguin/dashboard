import {ComponentPortal, PortalInjector} from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Injector,
  Input,
  Output,
  SimpleChanges
} from '@angular/core';
import {ItemGroupsDataSource} from 'app/package/items-renderer/item-groups-data-source';

import {DisplayType, Widget} from '../dashboard';

import {WIDGET_DATA, WidgetData} from './list/list';


export type DataSourceFactory = () => ItemGroupsDataSource<any>;
export interface DataSource {
  id: string;
  label: string;
  factory: DataSourceFactory;
}

@Component({
  selector: 'widget-view',
  styleUrls: ['widget-view.scss'],
  templateUrl: 'widget-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'theme-background-card theme-border',
  },
})
export class WidgetView {
  @Input() widgetTypes: {[key in DisplayType]: any};

  @Input() widget: Widget;

  @Input() editMode: boolean;

  @Input() dataSourceFactory: DataSourceFactory;

  @Output() edit = new EventEmitter<void>();

  @Output() duplicate = new EventEmitter<void>();

  @Output() remove = new EventEmitter<void>();

  @Output() open = new EventEmitter<Widget>();

  widgetComponentPortal: ComponentPortal<any>;

  constructor(private injector: Injector) {}

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['widget'] && this.widget) {
      this.createWidget();
    }
  }

  private createWidget() {
    const itemGroupsDataSource = this.dataSourceFactory();
    if (this.widget.filtererState) {
      itemGroupsDataSource.filterer.setState(this.widget.filtererState);
    }

    const widgetData: WidgetData<any> = {
      options: this.widget.displayTypeOptions,
      itemGroupsDataSource: itemGroupsDataSource,
    };

    const injectionTokens = new WeakMap<any, any>([[WIDGET_DATA, widgetData]]);
    const widgetInjector = new PortalInjector(this.injector, injectionTokens);
    this.widgetComponentPortal =
        new ComponentPortal(this.widgetTypes[this.widget.displayType!], null, widgetInjector);
  }
}