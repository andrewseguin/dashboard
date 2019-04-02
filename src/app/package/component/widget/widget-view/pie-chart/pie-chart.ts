import {ChangeDetectionStrategy, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {ItemFiltererState} from 'app/package/items-renderer/filterer';
import {ItemGroup, ItemGrouperState} from 'app/package/items-renderer/grouper';
import * as Chart from 'chart.js';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {WIDGET_DATA, WidgetData} from '../../widget';
import { MaterialColors } from '../widget-view';


export interface PieChartDisplayTypeOptions<G> {
  dataSourceType: string;
  grouperState: ItemGrouperState<G>;
  filteredGroups: string;
  filtererState: ItemFiltererState;
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

  constructor(@Inject(WIDGET_DATA) public data: WidgetData<PieChartDisplayTypeOptions<G>, null>) {}

  ngOnInit() {
    const dataSource = this.data.dataSources.get(this.data.options.dataSourceType)!.factory();
    dataSource.grouper.setState(this.data.options.grouperState);
    dataSource.filterer.setState(this.data.options.filtererState);
    dataSource.connect()
        .pipe(takeUntil(this.destroyed))
        .subscribe(result => this.render(result.groups));
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private getInfo(groups: ItemGroup<T>[]): {data: number[], labels: string[]} {
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

  render(groups: ItemGroup<T>[]) {
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
