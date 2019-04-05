import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {DataSource} from 'app/package/data-source/data-source';
import {Filterer, FiltererState} from 'app/package/data-source/filterer';
import {Sorter, SorterState} from 'app/package/data-source/sorter';
import {Viewer, ViewerState} from 'app/package/data-source/viewer';
import {Observable} from 'rxjs';

import {WIDGET_DATA, WidgetData} from '../../widget';

import {ListEdit} from './list-edit';

export type ListDataSources = Map<string, {
  id: string,
  label: string,
  filterer: (initialValue?: FiltererState) => Filterer,
  sorter: (initialValue?: SorterState) => Sorter,
  viewer: (initialValue?: ViewerState) => Viewer,
  dataSource: () => DataSource,
}>;

export interface ListWidgetDataConfig {
  dataSources: ListDataSources;
  onSelect: (item: any) => void;
}

export function getListWidgetConfig(dataSources: ListDataSources, onSelect: (item: any) => void) {
  return {
    id: 'list',
    label: 'List',
    component: List,
    editComponent: ListEdit,
    config: {dataSources, onSelect}
  };
}

export interface ListDisplayTypeOptions<S, V> {
  dataSourceType: string;
  listLength: number;
  sorterState: SorterState<S>;
  viewerState: ViewerState<V>;
  filtererState: FiltererState;
}

@Component({
  selector: 'list',
  templateUrl: 'list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class List<S, V> {
  trackByIndex = (index: number) => index;

  listLength = this.data.options.listLength;

  items: Observable<any[]>;

  viewer: Viewer<any, any, any>;

  constructor(@Inject(WIDGET_DATA) public data:
                  WidgetData<ListDisplayTypeOptions<S, V>, ListWidgetDataConfig>) {
    const dataSourceProvider = this.data.config.dataSources.get(this.data.options.dataSourceType)!;
    const sorter = dataSourceProvider.sorter(this.data.options.sorterState);
    const filterer = dataSourceProvider.filterer(this.data.options.filtererState);
    const provider = dataSourceProvider.dataSource();

    this.items = provider.getData().pipe(filterer.filter(), sorter.sort());

    this.viewer = dataSourceProvider.viewer(this.data.options.viewerState);
  }
}
