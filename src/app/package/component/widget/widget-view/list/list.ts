import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FiltererState} from 'app/package/data-source/filterer';
import {SorterState} from 'app/package/data-source/sorter';
import {Viewer, ViewerState} from 'app/package/data-source/viewer';
import {Observable} from 'rxjs';

import {WIDGET_DATA, WidgetData} from '../../widget';


export interface ListWidgetConfig {
  onSelect: (item: any) => void;
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
                  WidgetData<ListDisplayTypeOptions<S, V>, ListWidgetConfig>) {
    const dataSourceProvider = this.data.dataSources.get(this.data.options.dataSourceType)!;
    const sorter = dataSourceProvider.sorter(this.data.options.sorterState);
    const filterer = dataSourceProvider.filterer(this.data.options.filtererState);
    const provider = dataSourceProvider.dataSource();

    this.items = provider.getData().pipe(filterer.filter(), sorter.sort());

    this.viewer = dataSourceProvider.viewer(this.data.options.viewerState);
  }
}
