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
    }
  }

  getGroupAll(): IssueGroup[] {
    return [{id: 'all', title: ``, issues: this.issues}];
  }
}
