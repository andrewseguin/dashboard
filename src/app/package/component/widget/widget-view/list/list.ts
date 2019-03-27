import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {ItemFiltererState} from 'app/package/items-renderer/item-filterer';
import {ItemSorterState} from 'app/package/items-renderer/item-sorter';
import {ItemViewerState} from 'app/package/items-renderer/item-viewer';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {WIDGET_DATA, WidgetData} from '../../widget';


export interface ListWidgetConfig {
  onSelect: (item: any) => void;
}

export interface ListDisplayTypeOptions<S, V> {
  dataSourceType: string;
  listLength: number;
  sorterState: ItemSorterState<S>;
  viewerState: ItemViewerState<V>;
  filtererState: ItemFiltererState;
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

  constructor(@Inject(WIDGET_DATA) public data:
                  WidgetData<ListDisplayTypeOptions<S, V>, ListWidgetConfig>) {
    this.options = data.options;
    const dataSource = this.data.dataSources.get(this.data.options.dataSourceType)!.factory();
    dataSource.sorter.setState(this.options.sorterState);
    dataSource.viewer.setState(this.options.viewerState);
    dataSource.filterer.setState(this.options.filtererState);
    this.items = dataSource.connect().pipe(map(result => result.groups[0].items));
  }
}
