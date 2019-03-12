import {Group} from './item-renderer-options';

export class ItemGroup<T> {
  id: string;
  title: string;
  items: T[];
}

export class ItemGrouping<T> {
  groupingFunctions = new Map<string, (items: T[]) => ItemGroup<T>[]>();

  constructor() {
    this.groupingFunctions.set('all', (items: T[]) => {
      return [{id: 'all', title: ``, items}];
    });

    const properties = ['reporter'];
    properties.forEach(property => {
      this.groupingFunctions.set(property, (items: T[]) => getGroupByProperty(items, property));
    });
  }

  getGroups(items: T[], group: Group): ItemGroup<T>[] {
    const groupingFunction = this.groupingFunctions.get(group);
    return groupingFunction ? groupingFunction(items) : [];
  }
}


export function getGroupByProperty<T>(items: T[], property: string): ItemGroup<T>[] {
  const groups: Map<string, T[]> = new Map();

  items.forEach((item: any) => {
    const value = item[property];
    if (!groups.has(value)) {
      groups.set(value, []);
    }

    groups.get(value)!.push(item);
  });

  const requestGroups: ItemGroup<T>[] = [];
  groups.forEach((items, value) => {
    requestGroups.push({id: value, title: `${value} (${items.length})`, items});
  });

  return requestGroups;
}
