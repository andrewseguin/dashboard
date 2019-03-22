import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  Output
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ItemGroup} from 'app/package/items-renderer/item-grouper';
import {ItemGroupsDataSource} from 'app/package/items-renderer/item-groups-data-source';
import {ItemGroupsRenderer, RenderState} from 'app/package/items-renderer/item-groups-renderer';
import {combineLatest, fromEvent, Observable, Subject} from 'rxjs';
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


  activeItem = this.activatedRoute.queryParamMap.pipe(map(queryParamMap => {
    const item = queryParamMap.get('item');
    return item ? +item : '';
  }));

  itemCount: Observable<number>;

  @Input() itemGroupsDataSource: ItemGroupsDataSource<T>;

  @Output() itemSelected = new EventEmitter<T>();

  trackByIndex = (i: number) => i;

  renderState = new Subject<RenderState<T>>();

  hasMore: Observable<boolean>;

  constructor(
      public ngZone: NgZone, private activatedRoute: ActivatedRoute,
      public elementRef: ElementRef) {}

  ngOnInit() {
    const renderer = new ItemGroupsRenderer(this.itemGroupsDataSource, this.elementScrolled);
    renderer.renderedItemGroups.pipe(takeUntil(this.destroyed)).subscribe(result => {
      this.ngZone.run(() => this.renderState.next(result));
    });

    this.itemCount = this.itemGroupsDataSource.connect().pipe(map(result => result.count));

    this.hasMore =
        combineLatest(this.renderState, this.itemGroupsDataSource.connect()).pipe(map(result => {
          return result[0].count < result[1].count;
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
