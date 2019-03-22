import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges
} from '@angular/core';
import {Router} from '@angular/router';
import {ItemGroupsDataSource} from 'app/package/items-renderer/item-groups-data-source';
import {Theme} from 'app/repository/services';
import {ActiveStore} from 'app/repository/services/active-repo';
import * as Chart from 'chart.js';
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

  public itemGroupsDataSource: ItemGroupsDataSource<any>;

  constructor(private router: Router, private theme: Theme, private activeRepo: ActiveStore) {
    Chart.defaults.global.defaultFontColor = this.theme.isLight ? 'black' : 'white';
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['widget'] && this.widget) {
      this.itemGroupsDataSource = this.dataSourceFactory();
      if (this.widget.filtererState) {
        this.itemGroupsDataSource.filterer.setState(this.widget.filtererState);
      }
    }
  }

  openQuery() {
    this.router.navigate(
        [`${this.activeRepo.activeName}/query/new`],
        {queryParams: {'widget': JSON.stringify(this.widget)}});
  }
}
