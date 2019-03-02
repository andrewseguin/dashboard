import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Subject} from 'rxjs';

@Component({
  selector: 'display-options-header',
  templateUrl: 'display-options-header.html',
  styleUrls: ['display-options-header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayOptionsHeader {
  reverseSort = false;

  sorting = 'created';

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

  setSort(sort: string) {
    if (this.sorting === sort) {
      this.reverseSort = !this.reverseSort;
    } else {
      this.sorting = sort;
      this.reverseSort = false;
    }
  }
}
