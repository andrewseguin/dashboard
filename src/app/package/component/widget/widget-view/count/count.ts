import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {DataSource} from 'app/package/data-source/data-source';
import {Filterer, FiltererState} from 'app/package/data-source/filterer';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {SavedFiltererState} from '../../edit-widget/edit-widget';
import {WIDGET_DATA, WidgetData} from '../../widget';

import {EditCount} from './count-edit';
import {CountDisplayTypeOptions} from './count.module';


export type CountDataSources = Map<string, {
  id: string,
  label: string,
  filterer: (initialValue?: FiltererState) => Filterer,
  dataSource: () => DataSource,
}>;

export type CountWidgetDataConfig = {
  dataSources: CountDataSources; savedFiltererStates: Observable<SavedFiltererState[]>;
};

export function getCountWidgetConfig(
    dataSources: CountDataSources, savedFiltererStates: Observable<SavedFiltererState[]>) {
  return {
    id: 'count',
    label: 'Count',
    component: Count,
    editComponent: EditCount,
    config: {dataSources, savedFiltererStates}
  };
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
  count: Observable<number>;

  constructor(@Inject(WIDGET_DATA) public data:
                  WidgetData<CountDisplayTypeOptions, CountWidgetDataConfig>) {
    const dataSourceProvider = this.data.config.dataSources.get(this.data.options.dataSourceType)!;
    const filterer = dataSourceProvider.filterer(this.data.options.filtererState);
    const dataSource = dataSourceProvider.dataSource();
    this.count = dataSource.data.pipe(filterer.filter(), map(result => result.length));
  }
}
