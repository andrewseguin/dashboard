import {Item} from '../dao';
import {Group} from './item-renderer-options';


export class ItemGroup {
  id: string;
  title: string;
  items: Item[];
}

export class ItemGrouping {
  groupingFunctions = new Map<string, (items: Item[]) => ItemGroup[]>();

  constructor() {
    this.groupingFunctions.set('all', (items: Item[]) => {
      return [{id: 'all', title: ``, items}];
    });

    const properties = ['reporter'];
    properties.forEach(property => {
      this.groupingFunctions.set(property, (items: Item[]) => {
        return this.getGroupByProperty(items, property);
      });
    });
  }

  getGroups(items: Item[], group: Group): ItemGroup[] {
    return this.groupingFunctions.get(group)(items);
  }

  getGroupByProperty(items: Item[], property: string) {
    const groups: Map<string, Item[]> = new Map();

    items.forEach(item => {
      const value = item[property];
      if (!groups.has(value)) {
        groups.set(value, []);
      }

      groups.get(value).push(item);
    });

    const requestGroups: ItemGroup[] = [];
    groups.forEach((items, value) => {
      requestGroups.push({id: value, title: `${value} (${items.length})`, items});
    });

    return requestGroups;
  }
}
