import {Item} from 'app/service/github';
import {Repo} from 'app/service/repo-dao';

import {Group} from './issue-renderer-options';

export class ItemGroup {
  id: string;
  title: string;
  issues: Item[];
}

export class ItemGrouping {
  constructor(private issues: Item[], private repo: Repo) {}

  getGroup(group: Group) {
    switch (group) {
      case 'all':
        return this.getGroupAll();
      case 'reporter':
        return this.getGroupByProperty('reporter');
    }
  }

  getGroupAll(): ItemGroup[] {
    return [{id: 'all', title: ``, issues: this.issues}];
  }

  getGroupByProperty(property: string) {
    const groups: Map<string, Item[]> = new Map();

    this.issues.forEach(issue => {
      const value = issue[property];
      if (!groups.has(value)) {
        groups.set(value, []);
      }

      groups.get(value).push(issue);
    });

    const requestGroups = [];
    groups.forEach((issues, value) => {
      requestGroups.push(
          {id: value, title: `${value} (${issues.length})`, issues});
    });

    return requestGroups;
  }
}
