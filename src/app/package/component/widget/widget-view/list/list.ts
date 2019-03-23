import {ChangeDetectionStrategy, Component, Inject, InjectionToken} from '@angular/core';
import {
  WidgetDataOption
} from 'app/package/component/dashboard/edit-widget/widget-type-options/widget-type-options';
import {ItemGroupsDataSource} from 'app/package/items-renderer/item-groups-data-source';
import {ItemSorterState} from 'app/package/items-renderer/item-sorter';
import {ItemViewerState} from 'app/package/items-renderer/item-viewer';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export interface ListWidgetConfig {
  onSelect: (item: any) => void;
}

export interface WidgetData<O, C> {
  itemGroupsDataSource: ItemGroupsDataSource<any>;
  options: O;
  config?: C;
}

/** Injection token that can be used to access the data that was passed in to a dialog. */
export const WIDGET_DATA = new InjectionToken<any>('WidgetData');

export interface ListDisplayTypeOptions<S, V> {
  listLength: number;
  sorterState: ItemSorterState<S>;
  viewerState: ItemViewerState<V>;
}

export function getListConfigOptions(options: ListDisplayTypeOptions<any, any>):
    WidgetDataOption[] {
  return [
    {
      id: 'listLength',
      type: 'input',
      label: 'Max list length',
      inputType: 'number',
      initialValue: options && options.listLength ? options.listLength : 5,
    },
    {
      id: 'sorterState',
      type: 'sorterState',
      label: 'List sort',
      initialValue: options ? options.sorterState : null,
    },
    {
      id: 'viewerState',
      type: 'viewerState',
      label: 'View',
      initialValue: options ? options.viewerState : null,
    },
  ];
}

@Component({
  selector: 'list',
  templateUrl: 'list.html',
  styleUrls: ['list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class List<S, V> {
  trackByIndex = (index: number) => index;

  options: ListDisplayTypeOptions<S, V>;

  items: Observable<any[]>;

  constructor(@Inject(WIDGET_DATA) public data:
                  WidgetData<ListDisplayTypeOptions<S, V>, ListWidgetConfig>) {
    this.options = data.options;
    data.itemGroupsDataSource.sorter.setState(this.options.sorterState);
    data.itemGroupsDataSource.viewer.setState(this.options.viewerState);
    this.items =
        this.data.itemGroupsDataSource.connect().pipe(map(result => result.groups[0].items));
  }
}
