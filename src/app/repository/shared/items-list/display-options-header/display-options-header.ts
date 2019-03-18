import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {GroupingMetadata, ItemGrouper} from 'app/package/items-renderer/item-grouping';
import {
  ItemRendererOptionsState,
  Sort,
  ViewKey
} from 'app/package/items-renderer/item-renderer-options';

@Component({
  selector: 'display-options-header',
  templateUrl: 'display-options-header.html',
  styleUrls: ['display-options-header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayOptionsHeader<G> {
  groups: Map<G, GroupingMetadata<any, G, any>>;
  groupIds: G[] = [];

  sorts = new Map<Sort, string>([
    ['created', 'Date created'],
    ['title', 'Title'],
  ]);
  sortIds = Array.from(this.sorts.keys());

  views = new Map<ViewKey, string>([
    ['reporter', 'Reporter'],
    ['assignees', 'Assignees'],
    ['labels', 'Labels'],
    ['warnings', 'Warnings'],
    ['suggestions', 'Suggestions'],
  ]);
  viewKeys = Array.from(this.views.keys());

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

  @Output() optionsChanged = new EventEmitter<ItemRendererOptionsState>();

  setSort(sort: Sort) {
    const options = {...this.options};

    if (options.sorting === sort) {
      options.reverseSort = !options.reverseSort;
    } else {
      options.sorting = sort;
      options.reverseSort = false;
    }

    this.optionsChanged.emit(options);
  }

  toggleViewKey(viewKey: ViewKey) {
    const view = {...this.options.view};
    view[viewKey] = !view[viewKey];

    const options = {...this.options};
    options.view = view;
    this.optionsChanged.emit({...options});
  }
}
