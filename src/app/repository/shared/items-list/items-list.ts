import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone
} from '@angular/core';
import {MatDialog} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {ItemGroup} from 'app/package/items-renderer/item-grouper';
import {ItemGroupsDataSource} from 'app/package/items-renderer/item-groups-data-source';
import {ItemViewer} from 'app/package/items-renderer/item-viewer';
import {Item} from 'app/repository/services/dao';
import {ItemsFilterMetadata} from 'app/repository/utility/items-renderer/item-filter-metadata';
import {isMobile} from 'app/utility/media-matcher';
import {fromEvent, Observable, ReplaySubject, Subject} from 'rxjs';
import {auditTime, map, takeUntil} from 'rxjs/operators';
import {ItemDetailDialog} from '../dialog/item-detail-dialog/item-detail-dialog';

@Component({
  selector: 'items-list',
  templateUrl: 'items-list.html',
  styleUrls: ['items-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsList<G> {
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

  loadingIssues: boolean;

  itemGroups: ItemGroup<Item>[];
  renderedItemGroups: ItemGroup<Item>[];
  issuesToDisplay = 20;

  issueFilterMetadata = ItemsFilterMetadata;

  group = new ReplaySubject<G>();

  itemCount = new ReplaySubject<number>();

  @Input() itemGroupsDataSource: ItemGroupsDataSource<any>;

  @Input() viewer: ItemViewer<any>;

  trackByIndex = (i: number) => i;

  constructor(
      public cd: ChangeDetectorRef, public ngZone: NgZone, private router: Router,
      private dialog: MatDialog, private activatedRoute: ActivatedRoute,
      public elementRef: ElementRef) {}

  ngOnInit() {
    this.group.pipe(takeUntil(this.destroyed)).subscribe(() => {
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

    // When groups change, render the first ten, then debounce and render more
    this.itemGroupsDataSource.connect().pipe(takeUntil(this.destroyed)).subscribe(result => {
      this.itemGroups = result.groups;
      this.itemCount.next(result.count);
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

  getItemGroupKey(_i: number, itemGroup: ItemGroup<Item>) {
    return itemGroup.id;
  }
}
