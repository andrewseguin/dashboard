import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Router} from '@angular/router';
import {RepoDao} from 'app/service/repo-dao';
import {map} from 'rxjs/operators';
import {ActivatedRepository} from '../services/activated-repository';
import {IssueQueriesDao, IssueQuery} from '../services/dao/issue-queries-dao';


interface IssueQueryGroup {
  issueQueries: IssueQuery[];
  name: string;
}

@Component({
  styleUrls: ['issue-queries-page.scss'],
  templateUrl: 'issue-queries-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueQueriesPage {
  issueQueryGroups = this.issueQueriesDao.list.pipe(map(getSortedGroups));
  issueQueryKeyTrackBy = (_i, issueQuery: IssueQuery) => issueQuery.id;

  constructor(
      public issueQueriesDao: IssueQueriesDao, public repoDao: RepoDao,
      private router: Router,
      private activatedRepository: ActivatedRepository) {}

  createIssueQuery() {
    this.router.navigate(
        [`${this.activatedRepository.repository.value}/issue-query/new`]);
  }

  navigateToIssueQuery(id: string) {
    this.router.navigate(
        [`${this.activatedRepository.repository.value}/issue-query/${id}`]);
  }
}


function getSortedGroups(issueQueries: IssueQuery[]) {
  if (!issueQueries) {
    return;
  }

  const groups = new Map<string, IssueQuery[]>();
  issueQueries.forEach(issueQuery => {
    const group = issueQuery.group || 'Other';
    if (!groups.has(group)) {
      groups.set(group, []);
    }

    groups.get(group).push(issueQuery);
  });

  const sortedGroups: IssueQueryGroup[] = [];
  Array.from(groups.keys()).sort().forEach(group => {
    const issueQueries = groups.get(group);
    issueQueries.sort((a, b) => a.name < b.name ? -1 : 1);
    sortedGroups.push({name: group, issueQueries});
  });

  console.log(sortedGroups)

  return sortedGroups;
}
