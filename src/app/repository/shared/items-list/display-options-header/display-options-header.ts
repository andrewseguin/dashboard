import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {Group, Sort, ViewKey} from 'app/package/items-renderer/item-renderer-options';
import {ItemsRenderer} from 'app/package/items-renderer/items-renderer';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'display-options-header',
  templateUrl: 'display-options-header.html',
  styleUrls: ['display-options-header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayOptionsHeader {
  groups = new Map<Group, string>([
    ['all', 'None'],
    ['reporter', 'Reporter'],
    ['labels', 'Label'],
    ['assignees', 'Assignee'],
  ]);
  groupIds = Array.from(this.groups.keys());

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

  private destroyed = new Subject();

  constructor(public itemsRenderer: ItemsRenderer<any>, private cd: ChangeDetectorRef) {
    this.itemsRenderer.options.changed.pipe(takeUntil(this.destroyed)).subscribe(() => {
      this.cd.markForCheck();
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  setSort(sort: Sort) {
    const options = this.itemsRenderer.options;
    if (options.sorting === sort) {
      options.reverseSort = !options.reverseSort;
    } else {
      options.sorting = sort;
      options.reverseSort = false;
    }
  }

  toggleViewKey(viewKey: ViewKey) {
    const view = {...this.itemsRenderer.options.view};
    view[viewKey] = !view[viewKey];
    this.itemsRenderer.options.view = view;
  }
}
