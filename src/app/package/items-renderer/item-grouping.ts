import {Group} from './item-renderer-options';

export class ItemGroup<T> {
  id: string;
  title: string;
  items: T[];
}

export interface AutoGroup<G> {
  group: G;
  type: 'value'|'list';
  key: string;
  transform?: (value: string) => string;
}

export class ItemGrouping<T> {
  groupingFunctions = new Map<string, (items: T[]) => ItemGroup<T>[]>();

  constructor(autoGroups: AutoGroup<any>[]) {
    this.groupingFunctions.set('all', (items: T[]) => {
      return [{id: 'all', title: ``, items}];
    });

    autoGroups.forEach(autoGroup => {
      const key = autoGroup.key;
      const transform = autoGroup.transform || ((v: string) => v || 'None');
      switch (autoGroup.type) {
        case 'value':
          this.groupingFunctions.set(key, (items: T[]) => getGroupByValue(items, key, transform));
          break;
        case 'list':
          this.groupingFunctions.set(
              key, (items: T[]) => getGroupByListValues(items, key, transform));
          break;
      }
    });
  }

  getGroups(items: T[], group: Group): ItemGroup<T>[] {
    const groupingFunction = this.groupingFunctions.get(group);
    return groupingFunction ? groupingFunction(items) : [];
  }
}


export function getGroupByValue<T>(
    items: T[], property: string, transform: (v: string) => string): ItemGroup<T>[] {
  const map: Map<string, T[]> = new Map();

  items.forEach((item: any) => {
    const value = transform(item[property]);
    if (!map.has(value)) {
      map.set(value, []);
    }

    map.get(value)!.push(item);
  });

  return getGroupsFromMap(map);
}

export function getGroupByListValues<T>(
    items: T[], key: string, transform: (v: string) => string): ItemGroup<T>[] {
  const map: Map<string, T[]> = new Map();
  items.forEach((item: any) => {
    const values: any[] = item[key] ? item[key] : [];
    values.forEach((value: any) => {
      value = transform(value);
      if (!map.get(value)) {
        map.set(value, []);
      }
      map.get(value)!.push(item);
    });
  });

  return getGroupsFromMap(map);
}

export function getGroupsFromMap<T>(groupsMap: Map<string, T[]>) {
  const groups: ItemGroup<T>[] = [];
  groupsMap.forEach((items, title) => {
    groups.push({id: title, title, items});
  });

  return groups;
}
