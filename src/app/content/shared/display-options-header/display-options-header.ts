import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {Sort, SortId} from 'app/content/issues-page/issues-page';
import {Subject} from 'rxjs';

@Component({
  selector: 'display-options-header',
  templateUrl: 'display-options-header.html',
  styleUrls: ['display-options-header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayOptionsHeader {
  @Input() reverseSort = false;

  @Input() sort: SortId = 'created';

  @Output() sortChanged = new EventEmitter<Sort>();

  sorts = new Map<string, string>([
    ['created', 'Date created'],
  ]);
  sortIds = Array.from(this.sorts.keys());

  private destroyed = new Subject();

  constructor() {}

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  setSort(sort: SortId) {
    if (this.sort === sort) {
      this.reverseSort = !this.reverseSort;
    } else {
      this.sort = sort;
      this.reverseSort = false;
    }

    this.sortChanged.emit({id: sort, reverse: this.reverseSort});
  }
}
