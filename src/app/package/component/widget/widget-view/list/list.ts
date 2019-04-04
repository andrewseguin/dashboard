import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FiltererState} from 'app/package/data-source/filterer';
import {SorterState} from 'app/package/data-source/sorter';
import {Viewer, ViewerState} from 'app/package/data-source/viewer';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

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

  options: ListDisplayTypeOptions<S, V>;

  items: Observable<any[]>;

  viewer: Viewer<any, any, any>;

  constructor(@Inject(WIDGET_DATA) public data:
                  WidgetData<ListDisplayTypeOptions<S, V>, ListWidgetConfig>) {
    this.options = data.options;
    const dataSourceProvider = this.data.dataSources.get(this.data.options.dataSourceType)!;
    const dataSource = dataSourceProvider.factory();

    const sorter = dataSourceProvider.sorter();
    sorter.setState(this.options.sorterState);

    const filterer = dataSourceProvider.filterer();
    filterer.setState(this.options.filtererState);

    const grouper = dataSourceProvider.grouper();

    this.items = dataSource.connect(filterer, grouper, sorter).pipe(map(result => result[0].items));

    this.viewer = dataSourceProvider.viewer();
    this.viewer.setState(this.options.viewerState);
  }
}
