import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {ItemGroup} from 'app/package/items-renderer/item-grouper';
import {Theme} from 'app/repository/services';
import {Item, PieChartDisplayTypeOptions} from 'app/repository/services/dao';
import {GithubItemGroupsDataSource} from 'app/repository/services/github-item-groups-data-source';
import * as Chart from 'chart.js';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'pie-chart',
  templateUrl: 'pie-chart.html',
  styleUrls: ['pie-chart.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieChart<G> {
  chart: Chart;

  @Input() itemGroupsDataSource: GithubItemGroupsDataSource;

  @Input() options: PieChartDisplayTypeOptions<G>;

  @ViewChild('canvas') canvas: ElementRef;

  private destroyed = new Subject();

  constructor(private theme: Theme) {}

  ngOnInit() {
    this.itemGroupsDataSource.connect()
        .pipe(takeUntil(this.destroyed))
        .subscribe(result => this.render(result.groups));
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['options'] && this.options) {
      this.itemGroupsDataSource.grouper.setState(this.options.grouperState);
    }
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

  render(groups: ItemGroup<Item>[]) {
    if (this.options.filteredGroupsByTitle) {
      const filteredGroupsSet = new Set<string>(this.options.filteredGroupsByTitle);
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
      const options: Chart.ChartOptions = {
        cutoutPercentage: 50,
        legend: {labels: {fontColor: this.theme.isLight ? 'black' : 'white'}, position: 'bottom'}
      };

      this.chart = new Chart(this.canvas.nativeElement, {type: 'pie', data: chartData, options});
      this.chart.render();
    }
  }
}

const MaterialColors = [
  'rgba(33, 150, 243, 0.75)', 'rgba(244, 67, 54, 0.75)', 'rgba(76, 175, 80, 0.75)',
  'rgba(255, 193, 7, 0.75)', 'rgba(156, 39, 176, 0.75)', 'rgba(121, 85, 72, 0.75)',
  'rgba(255, 152, 0, 0.75)', 'rgba(0, 150, 136, 0.75)', 'rgba(156, 39, 176, 0.75)',
  'rgba(121, 85, 72, 0.75)'
];
