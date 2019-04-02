import {combineLatest, Observable} from 'rxjs';
import {auditTime, debounceTime, map, startWith} from 'rxjs/operators';
import {ItemGroup} from './grouper';
import {ItemGroupsDataSource} from './data-source';

export interface RenderState<T> {
  groups: ItemGroup<T>[];
  count: number;
  total: number;
}

export class ItemGroupsRenderer<T> {
  issuesToDisplay: number;

  itemGroups: ItemGroup<T>[];

  renderedItemGroups: Observable<RenderState<T>>;

  constructor(
      itemGroupsDataSource: ItemGroupsDataSource<T>, scroll: Observable<Event>, resetCount = 20,
      incrementCount = 20) {
    this.renderedItemGroups = combineLatest(
                                  itemGroupsDataSource.connect().pipe(debounceTime(50)),
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
    return distanceFromBottom <= 1000;
  }

  private isNearTop(el: HTMLElement) {
    return el.scrollTop <= 200;
  }

  getRenderState(): RenderState<T> {
    let total = 0;
    this.itemGroups.forEach(g => total += g.items.length);

    if (!this.itemGroups.length) {
      return {groups: [], count: 0, total};
    }

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

    return {groups: itemGroups, count, total};
  }
}
