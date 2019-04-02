import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  Output
} from '@angular/core';
import {ItemGroupsDataSource} from 'app/package/data-source/data-source';
import {Group} from 'app/package/data-source/grouper';
import {ItemGroupsRenderer, RendererState} from 'app/package/data-source/renderer';
import {fromEvent, Observable, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'items-list',
  templateUrl: 'items-list.html',
  styleUrls: ['items-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsList<T> {
  destroyed = new Subject();

  private elementScrolled: Observable<Event> = new Observable(
      (observer: any) => this.ngZone.runOutsideAngular(
          () => fromEvent(this.elementRef.nativeElement, 'scroll')
                    .pipe(takeUntil(this.destroyed))
                    .subscribe(observer)));

  itemCount: Observable<number>;

  @Input() activeItem: T;

  @Input() itemGroupsDataSource: ItemGroupsDataSource<T>;

  @Output() itemSelected = new EventEmitter<T>();

  trackByIndex = (i: number) => i;

  renderState = new Subject<RendererState<T>>();

  hasMore = this.renderState.pipe(map(state => state.count < state.total));

  constructor(public ngZone: NgZone, public elementRef: ElementRef) {}

  ngOnInit() {
    const renderer = new ItemGroupsRenderer(this.itemGroupsDataSource, this.elementScrolled);
    renderer.renderedItemGroups.pipe(takeUntil(this.destroyed)).subscribe(result => {
      this.ngZone.run(() => this.renderState.next(result));
    });

    this.itemCount = this.itemGroupsDataSource.connect().pipe(map(result => result.count));
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  getItemGroupKey(_i: number, itemGroup: Group<T>) {
    return itemGroup.id;
  }
}
