import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {
  Group,
  GroupIds,
  Groups,
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
export class DisplayOptionsHeader {
  groups = Groups;
  groupIds = GroupIds;

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

  setGroup(grouping: Group) {
    const options = {...this.options};
    options.grouping = grouping;
    this.optionsChanged.emit(options);
  }
}
