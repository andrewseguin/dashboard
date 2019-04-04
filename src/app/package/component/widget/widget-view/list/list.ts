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
    const dataSource = this.data.dataSources.get(this.data.options.dataSourceType)!.factory();
    dataSource.sorter.setState(this.options.sorterState);
    dataSource.filterer.setState(this.options.filtererState);
    this.items = dataSource.connect().pipe(map(result => result[0].items));

    this.viewer = this.data.dataSources.get(this.data.options.dataSourceType)!.viewer();
    this.viewer.setState(this.options.viewerState);
  }
}
