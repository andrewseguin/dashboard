import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {ItemGroup} from 'app/package/items-renderer/item-grouping';
import {ActiveRepo} from 'app/repository/services/active-repo';
import {Item, TimeSeriesDisplayTypeOptions, Widget} from 'app/repository/services/dao';
import {getItemsList, GithubItemsRenderer} from 'app/repository/services/github-items-renderer';
import {ItemRecommendations} from 'app/repository/services/item-recommendations';
import * as Chart from 'chart.js';
import {Subject} from 'rxjs';

interface CreatedAndClosedDate {
  created: string;
  closed: string;
}

interface DateCount {
  date: string;
  open: number;
  created: number;
  closed: number;
}

interface TimeSeriesData {
  x: string;
  y: number;
}

@Component({
  selector: 'time-series',
  templateUrl: 'time-series.html',
  styleUrls: ['time-series.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeSeries {
  chart: Chart;

  @Input() widget: Widget;

  @ViewChild('canvas') canvas: ElementRef;

  private destroyed = new Subject();

  public itemsRenderer = new GithubItemsRenderer(this.itemRecommendations, this.activeRepo);

  constructor(private itemRecommendations: ItemRecommendations, private activeRepo: ActiveRepo) {}

  ngOnInit() {
    this.itemsRenderer.connect().subscribe(result => this.render(result.groups));
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['widget'] && this.widget) {
      this.itemsRenderer.dataProvider =
          getItemsList(this.activeRepo.activeStore, this.widget.itemType);
      this.itemsRenderer.options.setState(this.widget.options);
    }
  }

  getDateCounts(dates: CreatedAndClosedDate[]): DateCount[] {
    const dateCountsMap = new Map<string, {created: number, closed: number, open: number}>();

    dates.forEach(date => {
      if (date.created) {
        if (!dateCountsMap.has(date.created)) {
          dateCountsMap.set(date.created, {created: 0, closed: 0, open: 0});
        }
        const count = dateCountsMap.get(date.created)!;
        dateCountsMap.set(
            date.created, {...count, created: count.created + 1, open: count.open + 1});
      }

      if (date.closed) {
        if (!dateCountsMap.has(date.closed)) {
          dateCountsMap.set(date.closed, {created: 0, closed: 0, open: 0});
        }
        const count = dateCountsMap.get(date.closed)!;
        dateCountsMap.set(date.closed, {...count, closed: count.closed + 1, open: count.open - 1});
      }
    });

    const dateCounts: DateCount[] = [];
    dateCountsMap.forEach((dateCount, date) => dateCounts.push({...dateCount, date}));
    dateCounts.sort((a, b) => a.date < b.date ? -1 : 1);
    return dateCounts;
  }

  roundDate(dateStr = ''): string {
    if (!dateStr) {
      return '';
    }

    switch ((this.widget.displayTypeOptions as TimeSeriesDisplayTypeOptions).group) {
      case 'day':
        return dateStr.substring(0, 10);
      case 'month':
        return dateStr.substring(0, 7) + '-01';
      case 'week':
        const date = new Date(dateStr.substring(0, 10));
        const newDate = date.getDate() - date.getDay();
        return new Date(date.setDate(newDate)).toISOString().substring(0, 10);
    }

    return '';
  }

  getData(items: Item[]):
      {open: TimeSeriesData[], created: TimeSeriesData[], closed: TimeSeriesData[]} {
    const dates: CreatedAndClosedDate[] = items.map(
        item => ({created: this.roundDate(item.created), closed: this.roundDate(item.closed)}));
    const dateCounts = this.getDateCounts(dates);

    let open = 0;
    let openData: {x: string, y: number}[] = [];
    let createdData: {x: string, y: number}[] = [];
    let closedData: {x: string, y: number}[] = [];
    dateCounts.forEach((dateCount => {
      open += dateCount.open;
      openData.push({x: dateCount.date, y: open});
      createdData.push({x: dateCount.date, y: dateCount.created});
      closedData.push({x: dateCount.date, y: dateCount.closed});
    }));

    return {created: createdData, closed: closedData, open: openData};
  }

  getDatasets(items: Item[]): Chart.ChartDataSets[] {
    const data = this.getData(items);

    const datasets = [];
    const options = this.widget.displayTypeOptions as TimeSeriesDisplayTypeOptions;
    const enabledDatasets =
        new Set<string>(options.datasets instanceof Array ? options.datasets : [options.datasets]);
    if (enabledDatasets.has('created')) {
      datasets.push({
        label: 'Created',
        data: data.created,
        fill: false,
        borderColor: 'rgba(33, 150, 243, 0.75)'
      });
    }
    if (enabledDatasets.has('closed')) {
      datasets.push({
        label: 'Closed',
        data: data.closed,
        fill: false,
        borderColor: 'rgba(244, 67, 54, 0.75)'
      });
    }
    if (enabledDatasets.has('open')) {
      datasets.push(
          {label: 'Open', data: data.open, fill: false, borderColor: 'rgba(76, 175, 80, 0.75)'});
    }

    return datasets;
  }

  render(groups: ItemGroup<Item>[]) {
    const items: Item[] = [];
    groups.forEach(g => items.push(...g.items));
    const datasets = this.getDatasets(items);

    const options = this.widget.displayTypeOptions as TimeSeriesDisplayTypeOptions;
    const time: Chart.TimeScale = {min: options.start, max: options.end, tooltipFormat: 'll'};

    if (this.chart) {
      // Remove animations since dataset changes can cause weird glitching
      this.chart.config.options!.animation!.duration = 0;
      this.chart.data.datasets = datasets;
      this.chart.config.options!.scales!.xAxes![0].time = time;
      this.chart.update();
    } else {
      const config: Chart.ChartConfiguration = {
        type: 'line',
        data: {datasets},
        options: {
          responsive: true,
          legend: {display: false},
          elements: {point: {radius: 2}, line: {tension: 0}},
          scales: {
            xAxes: [{type: 'time', time, scaleLabel: {display: true, labelString: 'Date'}}],
            yAxes: [{scaleLabel: {display: true, labelString: 'value'}}]
          }
        }
      };
      this.chart = new Chart(this.canvas.nativeElement, config);
      this.chart.render();
    }
  }
}
