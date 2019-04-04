import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  Output
} from '@angular/core';
import {DataSource} from 'app/package/data-source/data-source';
import {Group} from 'app/package/data-source/grouper';
import {RendererState, renderItemGroups} from 'app/package/utility/renderer';
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

  @Input() activeItem: T;

  @Input() dataSource: DataSource<T>;

  @Output() itemSelected = new EventEmitter<T>();

  itemCount: Observable<number>;

  trackByIndex = (i: number) => i;

  renderState = new Subject<RendererState<T>>();

  hasMore = this.renderState.pipe(map(state => state.count < state.total));

  constructor(public ngZone: NgZone, public elementRef: ElementRef) {}

  ngOnInit() {
    this.itemCount = this.dataSource.connect().pipe(map(
        itemGroups => itemGroups.map(g => g.items.length).reduce((prev, curr) => curr += prev)));

    this.dataSource.connect()
        .pipe(renderItemGroups(this.elementScrolled), takeUntil(this.destroyed))
        .subscribe(result => {
          this.ngZone.run(() => this.renderState.next(result));
        });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  getItemGroupKey(_i: number, itemGroup: Group<T>) {
    return itemGroup.id;
  }
}
