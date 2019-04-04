import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {WIDGET_DATA, WidgetData} from '../../widget';

import {EditCount} from './count-edit';
import {CountDisplayTypeOptions} from './count.module';


@Component({
  selector: 'count',
  template: `{{count | async}}`,
  styles: [`
    :host {
      display: block;
      text-align: center;
      padding: 24px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.fontSize.px]': 'data.options.fontSize',
    'class': 'theme-text',
  }
})
export class Count {
  static editComponent = EditCount;

  count: Observable<number>;

  constructor(@Inject(WIDGET_DATA) public data: WidgetData<CountDisplayTypeOptions, null>) {
    const dataSourceProvider = this.data.dataSources.get(this.data.options.dataSourceType)!;
    const dataSource = dataSourceProvider.factory();
    const filterer = dataSourceProvider.filterer();
    const grouper = dataSourceProvider.grouper();
    const sorter = dataSourceProvider.sorter();
    const provider = dataSourceProvider.provider();
    filterer.setState(this.data.options.filtererState);
    this.count = dataSource.connect(provider, filterer, grouper, sorter).pipe(map(result => {
      return result.map(g => g.items.length).reduce((prev, curr) => curr += prev);
    }));
  }
}
