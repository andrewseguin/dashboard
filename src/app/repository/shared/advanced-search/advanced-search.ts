import {animate, style, transition, trigger} from '@angular/animations';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ItemFilterer} from 'app/package/items-renderer/item-filterer';
import {Query} from 'app/package/items-renderer/search-utility/query';
import {ANIMATION_DURATION} from 'app/utility/animations';
import {Observable, Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'advanced-search',
  templateUrl: 'advanced-search.html',
  styleUrls: ['advanced-search.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'[class.has-filters]': 'hasDisplayedFilters'},
  animations: [
    trigger(
        'expand',
        [
          transition(
              'void => true',
              [
                style({height: '0', opacity: 0}),
                animate(ANIMATION_DURATION, style({height: '*', opacity: 1})),
              ]),
          transition(
              ':leave',
              [
                style({height: '*', opacity: 1}),
                animate(ANIMATION_DURATION, style({height: '0', opacity: 0})),
              ]),
        ]),
  ]
})
export class AdvancedSearch implements OnInit, AfterViewInit, OnDestroy {
  searchFormControl = new FormControl('');
  destroyed = new Subject();

  autocomplete = new Map<string, Observable<string[]>>();

  focusInput = false;

  expandState = false;

  displayedFilterTypes: string[];

  trackByIndex = (i: number) => i;

  @Input() filterer: ItemFilterer<any, any, any>;

  hasDisplayedFilters: boolean;

  ngOnInit() {
    const metadata = this.filterer.metadata;

    metadata.forEach((value, key) => {
      if (value.autocomplete) {
        this.autocomplete.set(key, value.autocomplete(this.filterer.autocompleteContext));
      }
    });

    this.filterer.filters$.pipe(takeUntil(this.destroyed)).subscribe(filters => {
      this.hasDisplayedFilters = filters.some(filter => !filter.isImplicit);
    });

    this.filterer.search$.pipe(takeUntil(this.destroyed)).subscribe(search => {
      this.searchFormControl.setValue(search, {emitEvent: false});
    });
    this.searchFormControl.valueChanges.pipe(debounceTime(100), takeUntil(this.destroyed))
        .subscribe(value => this.filterer.search = value);

    this.displayedFilterTypes =
        Array.from(metadata.keys())
            .filter(key => metadata.get(key) && metadata.get(key)!.displayName)
            .sort((a, b) => {
              const nameA = metadata.get(a)!.displayName || '';
              const nameB = metadata.get(b)!.displayName || '';
              return nameA < nameB ? -1 : 1;
            });
  }

  ngAfterViewInit() {
    this.expandState = true;
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  addFilter(type: string) {
    this.focusInput = true;
    const filters = this.filterer.filters.slice();
    filters.push({type});
    this.filterer.filters = filters;
  }

  removeFilter(index: number) {
    const filters = this.filterer.filters.slice();
    filters.splice(index, 1);
    this.filterer.filters = filters;
  }

  queryChange(index: number, query: Query) {
    const filters = this.filterer.filters.slice();
    filters[index] = {...filters[index], query};
    this.filterer.filters = filters;
  }
}
