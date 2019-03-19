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

    this.filterer.state.pipe(takeUntil(this.destroyed)).subscribe(state => {
      this.hasDisplayedFilters = state.filters.some(filter => !filter.isImplicit);
      this.searchFormControl.setValue(state.search, {emitEvent: false});
    });

    this.searchFormControl.valueChanges.pipe(debounceTime(100), takeUntil(this.destroyed))
        .subscribe(search => {
          const filtererState = this.filterer.getState();
          this.filterer.setState({...filtererState, search});
        });

    this.displayedFilterTypes =
        Array.from(metadata.keys())
            .filter(key => metadata.get(key) && metadata.get(key)!.label)
            .sort((a, b) => {
              const nameA = metadata.get(a)!.label || '';
              const nameB = metadata.get(b)!.label || '';
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
    const filtererState = this.filterer.getState();

    this.focusInput = true;
    const filters = filtererState.filters.slice();
    filters.push({type});

    this.filterer.setState({...filtererState, filters});
  }

  removeFilter(index: number) {
    const filtererState = this.filterer.getState();

    const filters = filtererState.filters.slice();
    filters.splice(index, 1);

    this.filterer.setState({...filtererState, filters});
  }

  queryChange(index: number, query: Query) {
    const filtererState = this.filterer.getState();

    const filters = filtererState.filters.slice();
    filters[index] = {...filters[index], query};

    this.filterer.setState({...filtererState, filters});
  }
}
