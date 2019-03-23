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
import {DataSourceFactory} from 'app/package/items-renderer/data-source-provider';

import {Widget, WidgetConfig} from '../widget';

import {WIDGET_DATA, WidgetData} from './list/list';


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
  @Input() widgetConfig: WidgetConfig;

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

    const widgetData: WidgetData<any, any> = {
      options: this.widget.displayTypeOptions,
      itemGroupsDataSource: itemGroupsDataSource,
      config: this.widgetConfig.config,
    };

    const injectionTokens = new WeakMap<any, any>([[WIDGET_DATA, widgetData]]);
    const widgetInjector = new PortalInjector(this.injector, injectionTokens);
    this.widgetComponentPortal =
        new ComponentPortal(this.widgetConfig.component, null, widgetInjector);
  }
}
