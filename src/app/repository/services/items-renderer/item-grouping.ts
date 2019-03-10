import {Repo} from 'app/repository/services/dao/repo-dao';
import {Item} from '../dao';
import {Group} from './item-renderer-options';


export class ItemGroup {
  id: string;
  title: string;
  items: Item[];
}

export class ItemGrouping {
  constructor(private items: Item[], private repo: Repo) {}

  getGroup(group: Group): ItemGroup[] {
    switch (group) {
      case 'all':
        return this.getGroupAll();
      case 'reporter':
        return this.getGroupByProperty('reporter');
    }
  }

  getGroupAll(): ItemGroup[] {
    return [{id: 'all', title: ``, items: this.items}];
  }

  getGroupByProperty(property: string) {
    const groups: Map<string, Item[]> = new Map();

    this.items.forEach(item => {
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
