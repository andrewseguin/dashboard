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
import {Item, Widget} from 'app/repository/services/dao';
import * as Chart from 'chart.js';
import {Subject} from 'rxjs';
import {filter} from 'rxjs/operators';

interface CreatedAndClosedDate {
  created: string;
  closed: string;
}

@Component({
  selector: 'time-series',
  templateUrl: 'time-series.html',
  styleUrls: ['time-series.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeSeries {
  chart: Chart;

  @Input() itemsRenderer: ItemsRenderer<Item>;

  @Input() widget: Widget;

  @ViewChild('canvas') canvas: ElementRef;

  private destroyed = new Subject();

  ngOnInit() {
    //  const displayTypeOptions = this.widget.displayTypeOptions as TimeSeriesDisplayTypeOptions;
    this.itemsRenderer.itemGroups.pipe(filter(v => !!v)).subscribe(groups => this.render(groups!));
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['widget'] && this.widget) {
      this.itemsRenderer.options.setState(this.widget.options);
    }
  }

  getDateDifferences(dates: CreatedAndClosedDate[]): {date: string, difference: number}[] {
    const count = new Map<string, number>();

    dates.forEach(date => {
      if (date.created) {
        if (!count.has(date.created)) {
          count.set(date.created, 0);
        }
        count.set(date.created, count.get(date.created)! + 1);
      }
      if (date.closed) {
        if (!count.has(date.closed)) {
          count.set(date.closed, 0);
        }
        count.set(date.closed, count.get(date.closed)! - 1);
      }
    });

    const dateDifferences: {date: string, difference: number}[] = [];
    count.forEach((difference, date) => dateDifferences.push({date, difference}));
    dateDifferences.sort((a, b) => a.date < b.date ? -1 : 1);
    return dateDifferences;
  }

  getData(items: Item[]): {x: string, y: number}[] {
    const dates: CreatedAndClosedDate[] =
        items.map(item => ({
                    created: (item.created || '').substring(0, 10),
                    closed: (item.closed || '').substring(0, 10)
                  }));
    const dateDifferences = this.getDateDifferences(dates);

    let accumulatedCount = 0;
    const data: {x: string, y: number}[] = [];
    dateDifferences.forEach((dateDifference => {
      accumulatedCount += dateDifference.difference;
      data.push({x: dateDifference.date, y: accumulatedCount});
    }));

    return data;
  }

  render(groups: ItemGroup<Item>[]) {
    const items: Item[] = [];
    groups.forEach(g => items.push(...g.items));
    const data = this.getData(items);

    if (this.chart) {
      this.chart.data.datasets![0].data = data;
      this.chart.update();
    } else {
      const config: Chart.ChartConfiguration = {
        type: 'line',
        data: {
          datasets: [
            {label: 'Issues Opened', data, fill: false, borderColor: 'blue'},
          ]
        },
        options: {
          responsive: true,
          legend: {display: false},
          scales: {
            xAxes: [{
              type: 'time',
              time: {tooltipFormat: 'll'},
              scaleLabel: {display: true, labelString: 'Date'}
            }],
            yAxes: [{scaleLabel: {display: true, labelString: 'value'}}]
          }
        }
      };
      this.chart = new Chart(this.canvas.nativeElement, config);
      this.chart.render();
    }
  }
}
