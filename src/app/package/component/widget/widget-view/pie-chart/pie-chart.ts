import {ChangeDetectionStrategy, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {DataSource} from 'app/package/data-source/data-source';
import {Filterer, FiltererState} from 'app/package/data-source/filterer';
import {Group, Grouper, GrouperState} from 'app/package/data-source/grouper';
import * as Chart from 'chart.js';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {WIDGET_DATA, WidgetData} from '../../widget';
import {MaterialColors} from '../widget-view';

import {PieChartEdit} from './pie-chart-edit';

export type PieChartDataSources = Map<string, {
  id: string,
  label: string,
  filterer: (initialValue?: FiltererState) => Filterer,
  grouper: (initialValue?: GrouperState) => Grouper,
  dataSource: () => DataSource,
}>;

export interface PieChartWidgetDataConfig {
  dataSources: PieChartDataSources;
}

export function getPieChartWidgetConfig(dataSources: PieChartDataSources) {
  return {
    id: 'pie',
    label: 'Pie Chart',
    component: PieChart,
    editComponent: PieChartEdit,
    config: {dataSources}
  };
}

export interface PieChartDisplayTypeOptions<G> {
  dataSourceType: string;
  grouperState: GrouperState<G>;
  filteredGroups: string;
  filtererState: FiltererState;
}

@Component({
  selector: 'pie-chart',
  template: `<canvas #canvas></canvas>`,
  styleUrls: ['pie-chart.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieChart<T, G> {
  chart: Chart;

  @ViewChild('canvas') canvas: ElementRef;

  private destroyed = new Subject();

  constructor(@Inject(WIDGET_DATA) public data:
                  WidgetData<PieChartDisplayTypeOptions<G>, PieChartWidgetDataConfig>) {}

  ngOnInit() {
    const dataSourceProvider = this.data.config.dataSources.get(this.data.options.dataSourceType)!;
    const filterer = dataSourceProvider.filterer(this.data.options.filtererState);
    const grouper = dataSourceProvider.grouper(this.data.options.grouperState);
    const provider = dataSourceProvider.dataSource();

    provider.getData()
        .pipe(filterer.filter(), grouper.group(), takeUntil(this.destroyed))
        .subscribe(result => this.render(result));
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private getInfo(groups: Group<T>[]): {data: number[], labels: string[]} {
    const data: number[] = [];
    const labels: string[] = [];
    const LIMIT = 10;
    groups.forEach((group, index) => {
      if (index < LIMIT) {
        data[index] = group.items.length;
        labels[index] = group.title;
      } else {
        data[LIMIT] = (data[LIMIT] || 0) + group.items.length;
        labels[LIMIT] = 'Others';
      }
    });

    return {data, labels};
  }

  render(groups: Group<T>[]) {
    if (this.data.options.filteredGroups) {
      const filteredGroupsSet =
          new Set<string>(this.data.options.filteredGroups.split(',').map(v => v.trim()));
      groups = groups.filter(g => filteredGroupsSet.has(g.title));
    }

    const info = this.getInfo(groups);

    if (this.chart) {
      this.chart.data.datasets![0].data = info.data;
      this.chart.data.labels = info.labels;
      this.chart.update();
    } else {
      const chartData: Chart.ChartData = {
        datasets: [{data: info.data, backgroundColor: MaterialColors, borderColor: 'transparent'}],
        labels: info.labels
      };
      const options: Chart.ChartOptions = {cutoutPercentage: 50, legend: {position: 'bottom'}};

      this.chart = new Chart(this.canvas.nativeElement, {type: 'pie', data: chartData, options});
      this.chart.render();
    }
  }
}
