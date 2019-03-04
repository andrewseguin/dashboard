import {Issue} from 'app/service/github';
import {Repo} from 'app/service/repo-dao';

import {Group} from './issue-renderer-options';

export class IssueGroup {
  id: string;
  title: string;
  issues: Issue[];
}

export class IssueGrouping {
  constructor(private issues: Issue[], private repo: Repo) {}

  getGroup(group: Group) {
    switch (group) {
      case 'all':
        return this.getGroupAll();
      case 'reporter':
        return this.getGroupByProperty('reporter');
    }
  }

  getGroupAll(): IssueGroup[] {
    return [{id: 'all', title: ``, issues: this.issues}];
  }

  getGroupByProperty(property: string) {
    const groups: Map<string, Issue[]> = new Map();

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
