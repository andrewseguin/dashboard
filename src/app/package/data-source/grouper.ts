import {BehaviorSubject, Observable} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';

export interface GrouperState<G> {
  group: G|null;
}

export class Group<T> {
  id: string;
  title: string;
  items: T[];
}

export interface GrouperMetadata<T, G, C> {
  id: G;
  label: string;
  groupingFunction: (items: T[]) => Group<T>[];
  titleTransform?: (title: string, c: C) => string;
}

export class Grouper<T, G, C> {
  state = new BehaviorSubject<GrouperState<G>>({group: null});

  constructor(
      private titleTransformContextProvider: Observable<C>,
      public metadata: Map<G, GrouperMetadata<T, G, C>>) {}

  group(items: T[]): Observable<Group<T>[]> {
    let config: GrouperMetadata<T, G, C>|null;
    return this.state.pipe(
        map(state => {
          const group = state.group!;

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

  getGroups(): GrouperMetadata<T, G, C>[] {
    const groups: GrouperMetadata<T, G, C>[] = [];
    this.metadata.forEach(group => groups.push(group));
    return groups;
  }

  getState(): GrouperState<G> {
    return this.state.value;
  }

  setState(state: GrouperState<G>) {
    this.state.next({...state});
  }

  isEquivalent(otherState: GrouperState<G>) {
    return this.getState().group === otherState.group;
  }
}

/** Utility function that creates a group based on the value of the item's property. */
export function getGroupByValue<T>(items: T[], property: string): Group<T>[] {
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
export function getGroupByListValues<T>(items: T[], key: string): Group<T>[] {
  const map: Map<string, T[]> = new Map();
  items.forEach((item: any) => {
    let values: any[] = item[key];
    if (!values || !values.length) {
      values = [null];
    }
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
export function getGroupsFromMap<T>(groupsMap: Map<string, T[]>): Group<T>[] {
  const groups: Group<T>[] = [];
  groupsMap.forEach((items, title) => {
    title = `${title}`;  // TItle should always be a string, even if the ID is something else.
    groups.push({id: title, title, items});
  });

  return groups;
}
