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
import {ActiveRepo} from 'app/repository/services/active-repo';
import {Widget} from 'app/repository/services/dao/dashboard';
import {getItemsList, GithubItemsRenderer} from 'app/repository/services/github-items-renderer';
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

  public itemsRenderer = new GithubItemsRenderer(this.itemRecommendations, this.activeRepo);

  constructor(
      private router: Router, private theme: Theme, private activeRepo: ActiveRepo,
      private itemRecommendations: ItemRecommendations) {
    Chart.defaults.global.defaultFontColor = this.theme.isLight ? 'black' : 'white';
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['widget'] && this.widget) {
      this.itemsRenderer.dataProvider =
          getItemsList(this.activeRepo.activeStore, this.widget.itemType);

      if (this.widget.filtererState) {
        this.itemsRenderer.filterer.setState(this.widget.filtererState);
      }
    }
  }

  openQuery() {
    this.router.navigate(
        [`${this.activeRepo.activeRepository}/query/new`],
        {queryParams: {'widget': JSON.stringify(this.widget), dashboard: this.dashboardId}});
  }
}
