import {Filter} from 'app/repository/utility/search/filter';
import {Subject} from 'rxjs';

export type Group = 'all'|'reporter';

export type Sort = 'created'|'title';

export interface IssueRendererOptionsState {
  filters: Filter[];
  search: string;
  grouping: Group;
  sorting: Sort;
  reverseSort: boolean;
}

export class IssueRendererOptions {
  set filters(v: Filter[]) {
    if (this._filters === v) {
      return;
    }
    this._filters = v;
    this.changed.next();
  }
  get filters(): Filter[] {
    return this._filters;
  }
  private _filters: Filter[] = [];

  set search(v: string) {
    if (this._search === v) {
      return;
    }
    this._search = v;
    this.changed.next();
  }
  get search(): string {
    return this._search;
  }
  private _search = '';

  set grouping(v: Group) {
    if (this._grouping === v) {
      return;
    }
    this._grouping = v;
    this.changed.next();
  }
  get grouping(): Group {
    return this._grouping;
  }
  private _grouping: Group = 'all';

  set sorting(v: Sort) {
    if (this._sorting === v) {
      return;
    }
    this._sorting = v;
    this.changed.next();
  }
  get sorting(): Sort {
    return this._sorting;
  }
  private _sorting: Sort = 'created';

  set reverseSort(v: boolean) {
    if (this._reverseSort === v) {
      return;
    }
    this._reverseSort = v;
    this.changed.next();
  }
  get reverseSort(): boolean {
    return this._reverseSort;
  }
  private _reverseSort = true;

  changed = new Subject<void>();

  setState(options: IssueRendererOptionsState) {
    this._filters = options.filters;
    this._search = options.search;
    this._grouping = options.grouping;
    this._sorting = options.sorting;
    this._reverseSort = options.reverseSort;
    this.changed.next();
  }

  getState() {
    return {
      filters: this.filters,
      search: this.search,
      grouping: this.grouping,
      sorting: this.sorting,
      reverseSort: this.reverseSort,
    };
  }
}

export function areOptionStatesEqual(
    o1: IssueRendererOptionsState, o2: IssueRendererOptionsState) {
  return o1.grouping === o2.grouping && o1.reverseSort === o2.reverseSort &&
      o1.sorting === o2.sorting && o1.search === o2.search &&
      JSON.stringify(o1.filters.sort()) === JSON.stringify(o2.filters.sort());
}
