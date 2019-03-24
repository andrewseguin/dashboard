import {CdkPortal} from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  ViewChild
} from '@angular/core';
import {MatDialog} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {Item} from 'app/github/app-types/item';
import {Column, Dashboard, hasWidgets} from 'app/package/component/dashboard/dashboard';
import {SavedFiltererState} from 'app/package/component/widget/edit-widget/edit-widget';
import {Widget, WidgetConfig} from 'app/package/component/widget/widget';
import {Count, getCountConfigOptions} from 'app/package/component/widget/widget-view/count/count';
import {getListConfigOptions, List} from 'app/package/component/widget/widget-view/list/list';
import {
  getPieChartConfigOptions,
  PieChart
} from 'app/package/component/widget/widget-view/pie-chart/pie-chart';
import {
  getTimeSeriesConfigOptions,
  TimeSeries
} from 'app/package/component/widget/widget-view/time-series/time-series';
import {DataSourceProvider} from 'app/package/items-renderer/data-source-provider';
import * as Chart from 'chart.js';
import {BehaviorSubject, combineLatest, Subject, Subscription} from 'rxjs';
import {delay, map, mergeMap, takeUntil} from 'rxjs/operators';
import {DATA_SOURCES} from '../repository';
import {ActiveStore} from '../services/active-store';
import {Header} from '../services/header';
import {Theme} from '../services/theme';
import {ItemDetailDialog} from '../shared/dialog/item-detail-dialog/item-detail-dialog';

@Component({
  selector: 'dashboard-page',
  styleUrls: ['dashboard-page.scss'],
  templateUrl: 'dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  dashboard: Dashboard;

  edit = new BehaviorSubject<boolean>(false);

  trackByIndex = (i: number) => i;

  savedFiltererStates = this.activeRepo.config.pipe(
      mergeMap(config => combineLatest(config.queries.list, config.recommendations.list)),
      map(result => {
        const savedFiltererStates: SavedFiltererState[] = [];
        result[0].forEach(query => savedFiltererStates.push({
          state: query.filtererState!,
          label: query.name!,
          group: 'Queries',
        }));
        result[1].forEach(recommendation => savedFiltererStates.push({
          state: recommendation.filtererState!,
          label: recommendation.message!,
          group: 'Recommendations',
        }));
        return savedFiltererStates;
      }));

  widgetConfigs: {[key in string]: WidgetConfig} = {
    count: {
      id: 'count',
      label: 'Count',
      component: Count,
      optionsProvider: getCountConfigOptions,
    },
    list: {
      id: 'list',
      label: 'List',
      component: List,
      optionsProvider: getListConfigOptions,
      config: {
        onSelect:
            (item: Item) => {
              this.dialog.open(ItemDetailDialog, {data: {itemId: item.id}, width: '80vw'});
            }
      }
    },
    pie: {
      id: 'pie',
      label: 'Pie',
      component: PieChart,
      optionsProvider: getPieChartConfigOptions,
    },
    timeSeries: {
      id: 'timeSeries',
      label: 'Time Series',
      component: TimeSeries,
      optionsProvider: getTimeSeriesConfigOptions,
    },
  };

  private destroyed = new Subject();

  private getSubscription: Subscription;

  @ViewChild(CdkPortal) toolbarActions: CdkPortal;

  constructor(
      private dialog: MatDialog, private elementRef: ElementRef,
      @Inject(DATA_SOURCES) public dataSources: Map<string, DataSourceProvider>,
      private router: Router, private activatedRoute: ActivatedRoute, private theme: Theme,
      private activeRepo: ActiveStore, private header: Header, private cd: ChangeDetectorRef) {
    // TODO: Needs to listen for theme changes to know when this should change
    Chart.defaults.global.defaultFontColor = this.theme.isLight ? 'black' : 'white';


    this.activatedRoute.params.pipe(takeUntil(this.destroyed)).subscribe(params => {
      const id = params['id'];

      if (this.getSubscription) {
        this.getSubscription.unsubscribe();
      }

      if (id === 'new') {
        this.createNewDashboard();
        return;
      }

      // Delay added to improve page responsiveness on first load
      this.getSubscription =
          this.activeRepo.activeConfig.dashboards.map.pipe(delay(0), takeUntil(this.destroyed))
              .subscribe(map => {
                const dashboard = map.get(id);
                if (dashboard) {
                  this.setDashboard(dashboard);
                }
                this.cd.markForCheck();
              });
    });
  }

  private createNewDashboard() {
    const columns: Column[] = [{widgets: []}, {widgets: []}, {widgets: []}];
    const newDashboard: Dashboard = {name: 'New Dashboard', columnGroups: [{columns}]};
    this.setDashboard(newDashboard);
    const newDashboardId = this.activeRepo.activeConfig.dashboards.add(newDashboard);
    this.router.navigate(
        [`${this.activeRepo.activeName}/dashboard/${newDashboardId}`],
        {replaceUrl: true, queryParamsHandling: 'merge'});
  }

  ngOnInit() {
    this.header.toolbarOutlet.next(this.toolbarActions);
  }

  ngOnDestroy() {
    this.header.toolbarOutlet.next(null);
    this.destroyed.next();
    this.destroyed.complete();
  }

  saveDashboard(dashboard: Dashboard) {
    this.activeRepo.activeConfig.dashboards.update(dashboard);
  }

  setDashboard(dashboard: Dashboard) {
    this.dashboard = dashboard;
    this.header.title.next(this.dashboard.name || '');

    if (!hasWidgets(dashboard)) {
      this.edit.next(true);
    }

    this.header.goBack = true;
  }

  openQuery(widget: Widget) {
    this.router.navigate(
        [`../../query/new`],
        {queryParams: {'widget': JSON.stringify(widget)}, relativeTo: this.activatedRoute.parent});
  }

  fullscreen() {
    this.elementRef.nativeElement.requestFullscreen();
  }
}
