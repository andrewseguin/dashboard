import {Issue} from 'app/service/github';
import {Repo} from 'app/service/repo-dao';

import {Group} from './request-renderer-options';

export class RequestGroup {
  id: string;
  title: string;
  issues: Issue[];
}

export class RequestGrouping {
  constructor(private issues: Issue[], private repo: Repo) {}

  getGroup(group: Group) {
    switch (group) {
      case 'all':
        return this.getGroupAll();
    }
  }

  getGroupAll(): RequestGroup[] {
    return [
      {id: 'all', title: `${this.issues.length} issues`, issues: this.issues}
    ];
  }
}
