import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  Output
} from '@angular/core';
import {ItemGroup} from 'app/package/items-renderer/item-grouper';
import {ItemGroupsDataSource} from 'app/package/items-renderer/item-groups-data-source';
import {ItemGroupsRenderer, RenderState} from 'app/package/items-renderer/item-groups-renderer';
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

  renderState = new Subject<RenderState<T>>();

  hasMore = this.renderState.pipe(map(state => state.count < state.total));

  constructor(public ngZone: NgZone, public elementRef: ElementRef) {}

  ngOnInit() {
    const renderer = new ItemGroupsRenderer(this.itemGroupsDataSource, this.elementScrolled);
    renderer.renderedItemGroups.pipe(takeUntil(this.destroyed)).subscribe(result => {
      this.ngZone.run(() => this.renderState.next(result));
    });

    this.itemCount = this.itemGroupsDataSource.connect().pipe(map(result => {
      console.log('new count')
      return result.count;
    }));
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  getItemGroupKey(_i: number, itemGroup: ItemGroup<T>) {
    return itemGroup.id;
  }
}
