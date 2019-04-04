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
import {Filterer} from 'app/package/data-source/filterer';
import {Group} from 'app/package/data-source/grouper';
import {Viewer} from 'app/package/data-source/viewer';
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

  @Input() filterer: Filterer<T>;

  @Input() dataSource: DataSource<T>;

  @Input() viewer: Viewer<T, any, any>;

  @Output() itemSelected = new EventEmitter<T>();

  itemCount: Observable<number>;

  trackByIndex = (i: number) => i;

  renderState = new Subject<RendererState<T>>();

  hasMore = this.renderState.pipe(map(state => state.count < state.total));

  constructor(public ngZone: NgZone, public elementRef: ElementRef) {}

  ngOnInit() {
    this.itemCount =
        this.dataSource.connect(this.filterer)
            .pipe(
                map(itemGroups =>
                        itemGroups.map(g => g.items.length).reduce((prev, curr) => curr += prev)));

    this.dataSource.connect(this.filterer)
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
