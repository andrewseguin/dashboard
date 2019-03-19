import {ChangeDetectionStrategy, Component, ElementRef, Input, NgZone} from '@angular/core';
import {MatDialog} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {ItemGroup} from 'app/package/items-renderer/item-grouper';
import {ItemGroupsDataSource} from 'app/package/items-renderer/item-groups-data-source';
import {ItemGroupsRenderer, RenderState} from 'app/package/items-renderer/item-groups-renderer';
import {ItemViewer} from 'app/package/items-renderer/item-viewer';
import {Item} from 'app/repository/services/dao';
import {isMobile} from 'app/utility/media-matcher';
import {combineLatest, fromEvent, Observable, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {ItemDetailDialog} from '../dialog/item-detail-dialog/item-detail-dialog';

@Component({
  selector: 'items-list',
  templateUrl: 'items-list.html',
  styleUrls: ['items-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsList {
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

  @Input() itemGroupsDataSource: ItemGroupsDataSource<Item>;

  @Input() viewer: ItemViewer<any>;

  trackByIndex = (i: number) => i;

  renderState = new Subject<RenderState<Item>>();

  hasMore: Observable<boolean>;

  constructor(
      public ngZone: NgZone, private router: Router, private dialog: MatDialog,
      private activatedRoute: ActivatedRoute, public elementRef: ElementRef) {}

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

  getItemGroupKey(_i: number, itemGroup: ItemGroup<Item>) {
    return itemGroup.id;
  }

  navigateToItem(item: number) {
    if (!isMobile()) {
      this.router.navigate([], {
        relativeTo: this.activatedRoute.parent,
        queryParams: {item: item},
        queryParamsHandling: 'merge',
      });
    } else {
      this.dialog.open(ItemDetailDialog, {data: {item}});
    }
  }
}
