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
import {Filter, Filterer} from 'app/package/data-source/filterer';
import {DataSource} from 'app/package/data-source/data-source';
import {Query} from 'app/package/data-source/query';
import {Observable, Subject} from 'rxjs';
import {debounceTime, take, takeUntil} from 'rxjs/operators';

export const ANIMATION_DURATION = '250ms cubic-bezier(0.35, 0, 0.25, 1)';

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

  @Input() dataSource: DataSource<any>;

  @Input() filterer: Filterer<any, any>;

  hasDisplayedFilters: boolean;

  ngOnInit() {
    const metadata = this.filterer.metadata;

    metadata.forEach((value, key) => {
      if (value.autocomplete) {
        this.autocomplete.set(key, this.dataSource.data.pipe(this.filterer.autocomplete(value)));
      }
    });

    this.filterer.state.pipe(takeUntil(this.destroyed)).subscribe(state => {
      this.hasDisplayedFilters = state.filters.some(filter => !filter.isImplicit);
      this.searchFormControl.setValue(state.search, {emitEvent: false});
    });

    this.searchFormControl.valueChanges.pipe(debounceTime(100))
        .pipe(takeUntil(this.destroyed))
        .subscribe(search => {
          this.filterer.state.pipe(take(1)).subscribe(state => {
            this.filterer.setState({filters: state.filters, search});
          });
        });

    this.displayedFilterTypes = Array.from(metadata.keys())
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
    this.filterer.state.pipe(take(1)).subscribe(state => {
      this.focusInput = true;
      const filters = state.filters.slice();
      filters.push({type});

      this.filterer.setState({...state, filters});
    });
  }

  removeFilter(filter: Filter) {
    this.filterer.state.pipe(take(1)).subscribe(state => {
      const filters = state.filters.slice();
      const index = state.filters.indexOf(filter);

      if (index !== -1) {
        filters.splice(index, 1);
        this.filterer.setState({...state, filters});
      }
    });
  }

  queryChange(index: number, query: Query) {
    this.filterer.state.pipe(take(1)).subscribe(state => {
      const filters = state.filters.slice();
      filters[index] = {...filters[index], query};

      this.filterer.setState({...state, filters});
    });
  }
}
