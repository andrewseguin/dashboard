import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges
} from '@angular/core';
import {Router} from '@angular/router';
import {Theme} from 'app/repository/services';
import {ActiveStore} from 'app/repository/services/active-store';
import {Widget} from 'app/repository/services/dao/config/dashboard';
import {
  getItemsList,
  GithubItemGroupsDataSource
} from 'app/repository/services/github-item-groups-data-source';
import {ItemRecommendations} from 'app/repository/services/item-recommendations';
import * as Chart from 'chart.js';

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

  @Output() edit = new EventEmitter<void>();

  @Output() duplicate = new EventEmitter<void>();

  @Output() remove = new EventEmitter<void>();

  public itemGroupsDataSource =
      new GithubItemGroupsDataSource(this.itemRecommendations, this.activeStore);

  constructor(
      private router: Router, private theme: Theme, private activeStore: ActiveStore,
      private itemRecommendations: ItemRecommendations) {
    Chart.defaults.global.defaultFontColor = this.theme.isLight ? 'black' : 'white';
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['widget'] && this.widget) {
      this.itemGroupsDataSource.dataProvider =
          getItemsList(this.activeStore.activeData, this.widget.itemType);

      if (this.widget.filtererState) {
        this.itemGroupsDataSource.filterer.setState(this.widget.filtererState);
      }
    }
  }

  openQuery() {
    this.router.navigate(
        [`${this.activeStore.activeName}/query/new`],
        {queryParams: {'widget': JSON.stringify(this.widget), dashboard: this.dashboardId}});
  }
}
