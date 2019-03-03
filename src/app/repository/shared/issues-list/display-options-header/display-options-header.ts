import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {Group, Sort} from 'app/repository/services/issues-renderer/issue-renderer-options';
import {IssuesRenderer} from 'app/repository/services/issues-renderer/issues-renderer';
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
  ]);
  groupIds = Array.from(this.groups.keys());

  sorts = new Map<Sort, string>([
    ['created', 'Date created'],
    ['title', 'Title'],
  ]);
  sortIds = Array.from(this.sorts.keys());

  @Input() listLength: number;

  private destroyed = new Subject();

  constructor(
      public issuesRenderer: IssuesRenderer, private cd: ChangeDetectorRef) {
    this.issuesRenderer.options.changed.pipe(takeUntil(this.destroyed))
        .subscribe(() => {
          this.cd.markForCheck();
        });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  setSort(sort: Sort) {
    const options = this.issuesRenderer.options;
    if (options.sorting === sort) {
      options.reverseSort = !options.reverseSort;
    } else {
      options.sorting = sort;
      options.reverseSort = false;
    }
  }
}
