import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {Router} from '@angular/router';
import {Theme} from 'app/repository/services';
import {ActiveRepo} from 'app/repository/services/active-repo';
import {Widget} from 'app/repository/services/dao/dashboard';
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

  constructor(private router: Router, private theme: Theme, private activeRepo: ActiveRepo) {
    Chart.defaults.global.defaultFontColor = this.theme.isLight ? 'black' : 'white';
  }

  ngOnInit() {}

  openQuery() {
    this.router.navigate(
        [`${this.activeRepo.activeRepository}/query/new`],
        {queryParams: {'widget': JSON.stringify(this.widget), dashboard: this.dashboardId}});
  }
}
