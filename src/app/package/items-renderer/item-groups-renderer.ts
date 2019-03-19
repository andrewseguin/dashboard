import {combineLatest, Observable} from 'rxjs';
import {auditTime, debounceTime, map, startWith} from 'rxjs/operators';
import {ItemGroup} from './item-grouper';
import {ItemGroupsDataSource} from './item-groups-data-source';

export interface RenderState<T> {
  groups: ItemGroup<T>[];
  count: number;
}

export class ItemGroupsRenderer<T> {
  issuesToDisplay: number;

  itemGroups: ItemGroup<T>[];

  renderedItemGroups: Observable<RenderState<T>>;

  constructor(
      itemGroupsDataSource: ItemGroupsDataSource<T>, scroll: Observable<Event>, resetCount = 20,
      incrementCount = 20) {
    this.renderedItemGroups = combineLatest(
                                  itemGroupsDataSource.connect().pipe(debounceTime(200)),
                                  scroll.pipe(auditTime(200), startWith(null)))
                                  .pipe(map(result => {
                                    this.itemGroups = result[0].groups;

                                    const scrollEvent = result[1];
                                    if (!scrollEvent) {
                                      this.issuesToDisplay = resetCount;
                                    } else {
                                      const el = scrollEvent.target as HTMLElement;
                                      if (this.isNearTop(el)) {
                                        this.issuesToDisplay = resetCount;
                                      } else if (this.isNearBottom(el)) {
                                        this.issuesToDisplay += incrementCount;
                                      }
                                    }

                                    return this.getRenderState();
                                  }));
  }

  private isNearBottom(el: HTMLElement) {
    const viewHeight = el.getBoundingClientRect().height;
    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight;

    const distanceFromBottom = scrollHeight - scrollTop - viewHeight;

    if (distanceFromBottom <= 1000) {
      console.log('near bottom');
    }
    return distanceFromBottom <= 1000;
  }

  private isNearTop(el: HTMLElement) {
    const scrollTop = el.scrollTop;

    if (scrollTop <= 200) {
      console.log('near top');
    }
    return scrollTop <= 200;
  }

  getRenderState(): RenderState<T> {
    const itemGroups = [];
    let count = 0;

    let itemsToRender = this.issuesToDisplay;
    let index = 0;
    do {
      const itemGroup = this.itemGroups[index];
      const items = itemGroup.items.slice(0, itemsToRender);
      itemGroups.push({...itemGroup, items});
      itemsToRender -= itemGroup.items.length;
      count += items.length;
      index++;
    } while (itemsToRender > 0 && itemGroups.length !== this.itemGroups.length);

    return {groups: itemGroups, count};
  }
}
