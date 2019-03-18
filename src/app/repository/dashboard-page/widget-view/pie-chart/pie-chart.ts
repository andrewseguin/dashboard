import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {ItemGroup} from 'app/package/items-renderer/item-grouping';
import {Theme} from 'app/repository/services';
import {Item, ItemType, PieChartDisplayTypeOptions, Widget} from 'app/repository/services/dao';
import {ItemsRendererFactory} from 'app/repository/services/items-renderer-factory';
import * as Chart from 'chart.js';
import {Subject} from 'rxjs';

@Component({
  selector: 'pie-chart',
  templateUrl: 'pie-chart.html',
  styleUrls: ['pie-chart.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieChart {
  chart: Chart;

  @Input() widget: Widget;

  @ViewChild('canvas') canvas: ElementRef;
  private itemType = new Subject<ItemType>();

  private itemsRenderer = this.itemsRendererFactory.create(this.itemType);

  private destroyed = new Subject();

  constructor(private theme: Theme, private itemsRendererFactory: ItemsRendererFactory) {}

  ngOnInit() {
    this.itemsRenderer.connect().subscribe(result => this.render(result.groups));
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
      this.itemType.next(this.widget.itemType);
      this.setupItemsRenderer();
    }
  }

  render(groups: ItemGroup<Item>[]) {
    const options = this.widget.displayTypeOptions as PieChartDisplayTypeOptions;
    if (options.filteredGroups) {
      const filteredGroupsSet =
          new Set<string>(options.filteredGroups.split(',').map(v => v.trim()));
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

  private setupItemsRenderer() {
    const displayTypeOptions = this.widget.displayTypeOptions as PieChartDisplayTypeOptions;

    this.itemsRenderer.options.setState(
        {...this.widget.options!, grouping: displayTypeOptions.group!});
  }
}

const MaterialColors = [
  'rgba(33, 150, 243, 0.75)', 'rgba(244, 67, 54, 0.75)', 'rgba(76, 175, 80, 0.75)',
  'rgba(255, 193, 7, 0.75)', 'rgba(156, 39, 176, 0.75)', 'rgba(121, 85, 72, 0.75)',
  'rgba(255, 152, 0, 0.75)', 'rgba(0, 150, 136, 0.75)', 'rgba(156, 39, 176, 0.75)',
  'rgba(121, 85, 72, 0.75)'
];
