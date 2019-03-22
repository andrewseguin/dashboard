import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {map} from 'rxjs/operators';

import {ConfigOption} from '../../edit-widget/widget-type-options/widget-type-options';
import {WIDGET_DATA, WidgetData} from '../list/list';


export interface CountDisplayTypeOptions {
  fontSize: 'small'|'normal'|'large';
}

export function getCountConfigOptions(options: CountDisplayTypeOptions): ConfigOption[] {
  return [
    {
      id: 'fontSize',
      type: 'input',
      label: 'Font Size (px)',
      inputType: 'number',
      initialValue: options && options.fontSize ? options.fontSize : '48',
    },
  ];
}

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
  count = this.data.itemGroupsDataSource.connect().pipe(map(result => result.count));

  constructor(@Inject(WIDGET_DATA) public data: WidgetData<CountDisplayTypeOptions>) {}
}
