import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {GrouperMetadata, Grouper} from 'app/package/items-renderer/grouper';
import {Sorter, SortingMetadata} from 'app/package/items-renderer/sorter';
import {Viewer, ViewerMetadata} from 'app/package/items-renderer/viewer';

@Component({
  selector: 'display-options-header',
  templateUrl: 'display-options-header.html',
  styleUrls: ['display-options-header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayOptionsHeader<G, S, V> {
  groups: Map<G, GrouperMetadata<any, G, any>>;
  groupIds: G[] = [];

  sorts: Map<S, SortingMetadata<any, S, null>>;
  sortIds: S[] = [];

  views: Map<V, ViewerMetadata<V, any>>;
  viewIds: V[] = [];

  @Input() hideGrouping: boolean;

  @Input() itemCount: number;

  @Input()
  set grouper(grouper: Grouper<any, G, any>) {
    this._grouper = grouper;
    if (this.grouper) {
      this.groups = this.grouper.metadata;
      this.groupIds = this.grouper.getGroups().map(value => value.id);
    }
  }
  get grouper(): Grouper<any, G, any> {
    return this._grouper;
  }
  _grouper: Grouper<any, G, any>;

  @Input()
  set sorter(sorter: Sorter<any, S, any>) {
    this._sorter = sorter;
    if (this.sorter) {
      this.sorts = this.sorter.metadata;
      this.sortIds = this.sorter.getSorts().map(value => value.id);
    }
  }
  get sorter(): Sorter<any, S, any> {
    return this._sorter;
  }
  _sorter: Sorter<any, S, any>;

  @Input()
  set viewer(viewer: Viewer<V, any, any>) {
    this._viewer = viewer;
    if (this.viewer) {
      this.views = this.viewer.metadata;
      this.viewIds = this.viewer.getViews().map(value => value.id);
    }
  }
  get viewer(): Viewer<V, any, any> {
    return this._viewer;
  }
  _viewer: Viewer<V, any, any>;

  setGroup(group: G) {
    const grouperState = this.grouper.getState();
    this.grouper.setState({...grouperState, group});
  }

  setSort(sort: S) {
    const sorterState = this.sorter.getState();
    let reverse = sorterState.reverse;
    if (sorterState.sort === sort) {
      reverse = !reverse;
    } else {
      reverse = false;
    }

    this.sorter.setState({...sorterState, sort, reverse});
  }

  toggleViewKey(view: V) {
    this.viewer.toggle(view);
  }
}
