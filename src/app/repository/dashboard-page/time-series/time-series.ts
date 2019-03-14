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

  render(groups: ItemGroup<Item>[]) {
    console.log(groups);
    if (this.chart) {
      // this.chart.data.datasets![0].data = info.data;
      // this.chart.data.labels = info.labels;
      this.chart.update();
    } else {
      const openedCount = new Map<string, number>();
      groups.forEach(group => group.items.forEach(item => {
        const opened = item.created.substring(0, 10);
        if (!openedCount.has(opened)) {
          openedCount.set(opened, 0);
        }

        openedCount.set(opened, openedCount.get(opened)! + 1);
      }));

      const data: {x: string, y: number}[] = [];
      openedCount.forEach((y, x) => data.push({x, y}));

      // I want to add a count to each day until it was closed.

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
    };
  }
}
