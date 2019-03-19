import {BehaviorSubject, Observable} from 'rxjs';
import {filter, map, mergeMap} from 'rxjs/operators';

export interface ItemGrouperState<G> {
  group: G|null;
}

export class ItemGroup<T> {
  id: string;
  title: string;
  items: T[];
}

export interface GroupingMetadata<T, G, C> {
  id: G;
  label: string;
  groupingFunction: (items: T[]) => ItemGroup<T>[];
  titleTransform?: (title: string, c: C) => string;
}

export class ItemGrouper<T, G, C> {
  set group(group: G|null) {
    this.group$.next(group);
  }
  get group(): G|null {
    return this.group$.value;
  }
  group$ = new BehaviorSubject<G|null>(null);

  constructor(
      private titleTransformContextProvider: Observable<C>,
      public metadata: Map<G, GroupingMetadata<T, G, C>>) {}

  groupItems(items: T[]): Observable<ItemGroup<T>[]> {
    let config: GroupingMetadata<T, G, C>|null;
    return this.group$.pipe(
        filter(v => !!v), map(group => {
          group = group!;

          if (this.metadata.has(group)) {
            config = this.metadata.get(group) || null;
          }

          if (!config) {
            throw Error(`Missing config for group ${group}`);
          }

          return config.groupingFunction(items);
        }),
        mergeMap(itemGroups => {
          const titleTransform = config!.titleTransform || ((title: string) => title);

          return this.titleTransformContextProvider.pipe(map(context => {
            itemGroups.forEach(itemGroup => {
              itemGroup.title = titleTransform(itemGroup.title, context);
            });
            return itemGroups;
          }));
        }),
        map(itemGroups => {
          // TODO: Move sort function to the metadata
          return itemGroups.sort((a, b) => a.title < b.title ? -1 : 1);
        }));
  }

  getGroups(): GroupingMetadata<T, G, C>[] {
    const groups: GroupingMetadata<T, G, C>[] = [];
    this.metadata.forEach(group => groups.push(group));
    return groups;
  }

  getState(): ItemGrouperState<G> {
    return {group: this.group};
  }

  setState(state: ItemGrouperState<G>) {
    this.group = state.group;
  }
}

/** Utility function that creates a group based on the value of the item's property. */
export function getGroupByValue<T>(items: T[], property: string): ItemGroup<T>[] {
  const map: Map<string, T[]> = new Map();

  items.forEach((item: any) => {
    const value = item[property];
    if (!map.has(value)) {
      map.set(value, []);
    }

    map.get(value)!.push(item);
  });

  return getGroupsFromMap(map);
}

/** Utility function that creates a group based on the list of values of the item's property. */
export function getGroupByListValues<T>(items: T[], key: string): ItemGroup<T>[] {
  const map: Map<string, T[]> = new Map();
  items.forEach((item: any) => {
    const values: any[] = item[key] ? item[key] : [];
    values.forEach((value: any) => {
      if (!map.get(value)) {
        map.set(value, []);
      }
      map.get(value)!.push(item);
    });
  });

  return getGroupsFromMap(map);
}

/** Utility function that transforms a map of groups into a list. */
export function getGroupsFromMap<T>(groupsMap: Map<string, T[]>): ItemGroup<T>[] {
  const groups: ItemGroup<T>[] = [];
  groupsMap.forEach((items, title) => {
    groups.push({id: title, title, items});
  });

  return groups;
}
