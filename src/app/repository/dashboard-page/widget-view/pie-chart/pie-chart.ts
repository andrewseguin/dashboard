import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {ItemGroup} from 'app/package/items-renderer/item-grouping';
import {ItemsRenderer} from 'app/package/items-renderer/items-renderer';
import {Theme} from 'app/repository/services';
import {Item, PieChartWidget} from 'app/repository/services/dao';
import * as Chart from 'chart.js';
import {Subject} from 'rxjs';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'pie-chart',
  templateUrl: 'pie-chart.html',
  styleUrls: ['pie-chart.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieChart {
  chart: Chart;

  @Input() itemsRenderer: ItemsRenderer<Item>;

  @Input() widget: PieChartWidget;

  @ViewChild('canvas') canvas: ElementRef;

  private destroyed = new Subject();

  constructor(private theme: Theme) {}

  ngOnInit() {
    this.itemsRenderer.options.grouping = this.widget.groupBy!;
    this.itemsRenderer.itemGroups.pipe(filter(v => !!v)).subscribe(groups => this.render(groups!));
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private getInfo(groups: ItemGroup<Item>[]): {data: number[], labels: string[]} {
    const data: number[] = [];
    const labels: string[] = [];
    groups.forEach((group, index) => {
      if (index < 10) {
        data[index] = group.items.length;
        labels[index] = group.title;
      } else {
        data[10] = (data[10] || 0) + group.items.length;
        labels[10] = 'Others';
      }
    });

    return {data, labels};
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['widget'] && this.widget) {
      const options = {...this.widget.options!, groupBy: this.widget.groupBy!};
      this.itemsRenderer.options.setState(options);
    }
  }

  render(groups: ItemGroup<Item>[]) {
    const info = this.getInfo(groups);
    if (this.chart) {
      this.chart.data.datasets![0].data = info.data;
      this.chart.data.labels = info.labels;
      this.chart.update();
    } else {
      const chartData: Chart.ChartData = {
        datasets: [{data: info.data, backgroundColor: ['red', 'yellow', 'blue']}],
        labels: info.labels
      };
      const options: Chart.ChartOptions = {
        legend: {labels: {fontColor: this.theme.isLight ? 'black' : 'white'}, position: 'bottom'}
      };

      this.chart = new Chart(this.canvas.nativeElement, {type: 'pie', data: chartData, options});
      this.chart.render();
    }
  }
}
