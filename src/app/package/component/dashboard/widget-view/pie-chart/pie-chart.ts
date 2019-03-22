import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  SimpleChanges,
  ViewChild,
  Inject
} from '@angular/core';
import {ItemGroup, ItemGrouperState} from 'app/package/items-renderer/item-grouper';
import {ItemGroupsDataSource} from 'app/package/items-renderer/item-groups-data-source';
import * as Chart from 'chart.js';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ConfigOption} from '../../edit-widget/widget-type-options/widget-type-options';
import { WIDGET_DATA, WidgetData } from '../list/list';

export interface PieChartDisplayTypeOptions<G> {
  grouperState: ItemGrouperState<G>;
  filteredGroups: string;
}

export function getPieChartConfigOptions(options: PieChartDisplayTypeOptions<any>): ConfigOption[] {
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
  templateUrl: 'pie-chart.html',
  styleUrls: ['pie-chart.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieChart<T, G> {
  chart: Chart;

  @Input() itemGroupsDataSource: ItemGroupsDataSource<T>;

  @Input() options: PieChartDisplayTypeOptions<G>;

  @ViewChild('canvas') canvas: ElementRef;

  private destroyed = new Subject();

  constructor(@Inject(WIDGET_DATA) public data: WidgetData<PieChartDisplayTypeOptions<G>>) {
    this.itemGroupsDataSource = data.itemGroupsDataSource;
    this.options = data.options;
  }

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

  private getInfo(groups: ItemGroup<T>[]): {data: number[], labels: string[]} {
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

  render(groups: ItemGroup<T>[]) {
    if (this.options.filteredGroups) {
      const filteredGroupsSet =
          new Set<string>(this.options.filteredGroups.split(',').map(v => v.trim()));
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
  'rgba(33, 150, 243, 0.75)', 'rgba(244, 67, 54, 0.75)', 'rgba(76, 175, 80, 0.75)',
  'rgba(255, 193, 7, 0.75)', 'rgba(156, 39, 176, 0.75)', 'rgba(121, 85, 72, 0.75)',
  'rgba(255, 152, 0, 0.75)', 'rgba(0, 150, 136, 0.75)', 'rgba(156, 39, 176, 0.75)',
  'rgba(121, 85, 72, 0.75)'
];