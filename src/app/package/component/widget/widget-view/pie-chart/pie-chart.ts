import { ChangeDetectionStrategy, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { ItemGroup, ItemGrouperState } from 'app/package/items-renderer/item-grouper';
import * as Chart from 'chart.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WidgetDataOption } from '../../edit-widget/widget-type-options/widget-type-options';
import { WidgetData, WIDGET_DATA } from '../list/list';



export interface PieChartDisplayTypeOptions<G> {
  grouperState: ItemGrouperState<G>;
  filteredGroups: string;
}

export function getPieChartConfigOptions(options: PieChartDisplayTypeOptions<any>):
    WidgetDataOption[] {
  return [
    {
      id: 'grouperState',
      type: 'grouperState',
      label: 'Grouping',
      initialValue: options ? options.grouperState : null,
    },
    {
      id: 'filteredGroups',
      type: 'input',
      inputType: 'text',
      label: 'Filter (optional)',
      placeholder: 'Filter by group title, e.g. "Group A, Group B"',
      initialValue: options ? options.filteredGroups : null,
    },
  ];
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

  constructor(@Inject(WIDGET_DATA) public data: WidgetData<PieChartDisplayTypeOptions<G>, null>) {
    data.itemGroupsDataSource = data.itemGroupsDataSource;
  }

  ngOnInit() {
    this.data.itemGroupsDataSource.grouper.setState(this.data.options.grouperState);
    this.data.itemGroupsDataSource.connect()
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

const MaterialColors = [
  '#3366CC', '#DC3912', '#FF9900', '#109618', '#990099', '#3B3EAC', '#0099C6',
  '#DD4477', '#66AA00', '#B82E2E', '#316395', '#994499', '#22AA99', '#AAAA11',
  '#6633CC', '#E67300', '#8B0707', '#329262', '#5574A6', '#3B3EAC'
];
