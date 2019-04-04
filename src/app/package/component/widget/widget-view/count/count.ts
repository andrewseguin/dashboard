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
    const filterer = dataSourceProvider.filterer(this.data.options.filtererState);
    const provider = dataSourceProvider.dataSource();
    this.count = provider.getData().pipe(filterer.filter(), map(result => result.length));
  }
}
