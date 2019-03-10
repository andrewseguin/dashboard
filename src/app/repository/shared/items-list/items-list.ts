import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  Output
} from '@angular/core';
import {ItemGroup} from 'app/repository/services/items-renderer/item-grouping';
import {
  ItemRendererOptionsState
} from 'app/repository/services/items-renderer/item-renderer-options';
import {ItemsFilterMetadata} from 'app/repository/services/items-renderer/items-filter-metadata';
import {ItemsRenderer} from 'app/repository/services/items-renderer/items-renderer';
import {fromEvent, Observable, Observer, Subject} from 'rxjs';
import {auditTime, debounceTime, delay, takeUntil} from 'rxjs/operators';
import { ItemType } from 'app/repository/services/dao';

@Component({
  selector: 'items-list',
  templateUrl: 'items-list.html',
  styleUrls: ['items-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ItemsRenderer]
})
export class ItemsList {
  destroyed = new Subject();
  private elementScrolled: Observable<Event> = Observable.create(
      (observer: Observer<Event>) => this.ngZone.runOutsideAngular(
          () => fromEvent(this.elementRef.nativeElement, 'scroll')
                    .pipe(takeUntil(this.destroyed))
                    .subscribe(observer)));

  loadingIssues: boolean;

  itemGroups: ItemGroup[];
  renderedItemGroups: ItemGroup[];
  issuesToDisplay = 20;

  issueFilterMetadata = ItemsFilterMetadata;

  @Input()
  set issuesRendererOptionsState(state: ItemRendererOptionsState) {
    this.itemsRenderer.options.setState(state);
  }

  @Input() printMode: boolean;

  @Input() type: ItemType;

  @Output() issuesRendererOptionsChanged = new EventEmitter<ItemRendererOptionsState>();

  constructor(
      public itemsRenderer: ItemsRenderer, public cd: ChangeDetectorRef, public ngZone: NgZone,
      public elementRef: ElementRef) {}

  ngOnInit() {
    this.itemsRenderer.initialize(this.type);
    const options = this.itemsRenderer.options;
    options.changed.pipe(debounceTime(100), takeUntil(this.destroyed)).subscribe(() => {
      this.issuesRendererOptionsChanged.next(options.getState());
      this.elementRef.nativeElement.scrollTop = 0;
    });

    // After 200ms of scrolling, add 50 more issues if near bottom of screen
    this.elementScrolled.pipe(auditTime(200), takeUntil(this.destroyed)).subscribe(() => {
      const el = this.elementRef.nativeElement;
      const viewHeight = el.getBoundingClientRect().height;
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight;

      const distanceFromBottom = scrollHeight - scrollTop - viewHeight;
      if (distanceFromBottom < 1000 && scrollTop > 200) {
        this.issuesToDisplay += 40;
        this.render();
        this.ngZone.run(() => this.cd.markForCheck());
      } else if (scrollTop < 200) {
        if (this.issuesToDisplay != 20) {
          this.issuesToDisplay = 20;
          this.render();
          this.ngZone.run(() => this.cd.markForCheck());
        }
      }
    });

    // When groups change, render the first ten, then debounce and
    // render more
    this.itemsRenderer.itemGroups.pipe(takeUntil(this.destroyed)).subscribe(itemGroups => {
      this.itemGroups = itemGroups;
      this.render();
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  render() {
    this.renderedItemGroups = [];
    this.renderMoreIssues(this.issuesToDisplay);
    this.cd.markForCheck();
  }

  /** Render more issues, shoud only be called by render and itself. */
  renderMoreIssues(threshold: number) {
    // Return if there are no groups to render
    if (!this.itemGroups || !this.itemGroups.length) {
      return;
    }

    // If no groups are rendered yet, start by adding the first group
    if (!this.renderedItemGroups.length) {
      this.renderNextGroup();
    }

    const groupIndex = this.renderedItemGroups.length - 1;
    const renderGroup = this.renderedItemGroups[groupIndex];
    const renderLength = renderGroup.items.length;

    const actualGroup = this.itemGroups[groupIndex];
    const actualLength = actualGroup.items.length;

    // Return if all issues have been rendered
    if (this.renderedItemGroups.length === this.itemGroups.length &&
        renderGroup.items.length === actualGroup.items.length) {
      this.loadingIssues = false;
      return;
    } else {
      this.loadingIssues = true;
    }

    const difference = actualLength - renderLength;

    if (difference > threshold) {
      renderGroup.items = actualGroup.items.slice(0, renderLength + threshold);
    } else {
      renderGroup.items = actualGroup.items.slice();
      this.renderNextGroup();
      this.renderMoreIssues(threshold - difference);
    }
  }

  renderNextGroup() {
    if (this.itemGroups.length === this.renderedItemGroups.length) {
      return;
    }

    const nextRenderedItemGroup = this.itemGroups[this.renderedItemGroups.length];
    this.renderedItemGroups.push({...nextRenderedItemGroup, items: []});
  }

  getItemGroupKey(_i: number, itemGroup: ItemGroup) {
    return itemGroup.id;
  }
}
