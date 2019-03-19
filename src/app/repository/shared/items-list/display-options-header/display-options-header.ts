import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {GroupingMetadata, ItemGrouper} from 'app/package/items-renderer/item-grouper';
import {ItemRendererOptionsState, ViewKey} from 'app/package/items-renderer/item-renderer-options';
import {ItemSorter, SortingMetadata} from 'app/package/items-renderer/item-sorter';
import {ItemViewer, ViewingMetadata} from 'app/package/items-renderer/item-viewer';

@Component({
  selector: 'display-options-header',
  templateUrl: 'display-options-header.html',
  styleUrls: ['display-options-header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayOptionsHeader<G, S, V> {
  groups: Map<G, GroupingMetadata<any, G, any>>;
  groupIds: G[] = [];

  sorts: Map<S, SortingMetadata<any, S, null>>;
  sortIds: S[] = [];

  views: Map<V, ViewingMetadata<V>>;
  viewIds: V[] = [];

  @Input() hideGrouping: boolean;

  @Input() options: ItemRendererOptionsState;

  @Input() itemCount: number;

  @Input()
  set grouper(grouper: ItemGrouper<any, G, any>) {
    this._grouper = grouper;
    if (this.grouper) {
      this.groups = this.grouper.metadata;
      this.groupIds = this.grouper.getGroups().map(value => value.id);
    }
  }
  get grouper(): ItemGrouper<any, G, any> {
    return this._grouper;
  }
  _grouper: ItemGrouper<any, G, any>;

  @Input()
  set sorter(sorter: ItemSorter<any, S, any>) {
    this._sorter = sorter;
    if (this.sorter) {
      this.sorts = this.sorter.metadata;
      this.sortIds = this.sorter.getSorts().map(value => value.id);
    }
  }
  get sorter(): ItemSorter<any, S, any> {
    return this._sorter;
  }
  _sorter: ItemSorter<any, S, any>;

  @Input()
  set viewer(viewer: ItemViewer<V>) {
    this._viewer = viewer;
    if (this.viewer) {
      this.views = this.viewer.metadata;
      this.viewIds = this.viewer.getViews().map(value => value.id);
    }
  }
  get viewer(): ItemViewer<V> {
    return this._viewer;
  }
  _viewer: ItemViewer<V>;

  @Output() optionsChanged = new EventEmitter<ItemRendererOptionsState>();

  setSort(sort: S) {
    if (this.sorter.sort === sort) {
      this.sorter.reverse = !this.sorter.reverse;
    } else {
      this.sorter.sort = sort;
      this.sorter.reverse = false;
    }
  }

  toggleViewKey(view: V) {
    this.viewer.toggle(view);
  }
}
