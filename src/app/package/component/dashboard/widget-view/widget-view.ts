import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges
} from '@angular/core';
import {ItemGroupsDataSource} from 'app/package/items-renderer/item-groups-data-source';
import {Widget} from '../dashboard';

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
  @Input() widget: Widget;

  @Input() editMode: boolean;

  @Input() dashboardId: string;

  @Input() dataSourceFactory: DataSourceFactory;

  @Output() edit = new EventEmitter<void>();

  @Output() duplicate = new EventEmitter<void>();

  @Output() remove = new EventEmitter<void>();

  @Output() open = new EventEmitter<Widget>();

  public itemGroupsDataSource: ItemGroupsDataSource<any>;

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['widget'] && this.widget) {
      this.itemGroupsDataSource = this.dataSourceFactory();
      if (this.widget.filtererState) {
        this.itemGroupsDataSource.filterer.setState(this.widget.filtererState);
      }
    }
  }
}
