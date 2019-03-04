import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Router} from '@angular/router';
import {RepoDao} from 'app/service/repo-dao';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {ActivatedRepository} from '../services/activated-repository';
import {Report, ReportsDao} from '../services/dao/reports-dao';

interface ReportGroup {
  reports: Report[];
  name: string;
}

@Component({
  styleUrls: ['issue-queries-page.scss'],
  templateUrl: 'issue-queries-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueQueriesPage {
  reportGroups = this.reportsDao.list.pipe(map(getSortedGroups));
  reportKeyTrackBy = (_i, report: Report) => report.id;

  constructor(
      public reportsDao: ReportsDao, public repoDao: RepoDao,
      private router: Router,
      private activatedRepository: ActivatedRepository) {}

  createReport() {
    this.router.navigate(
        [`${this.activatedRepository.repository.value}/issue-query/new`]);
  }

  navigateToReport(id: string) {
    this.router.navigate(
        [`${this.activatedRepository.repository.value}/issue-query/${id}`]);
  }
}


function getSortedGroups(reports: Report[]) {
  if (!reports) {
    return;
  }

  const groups = new Map<string, Report[]>();
  reports.forEach(report => {
    const group = report.group || 'Other';
    if (!groups.has(group)) {
      groups.set(group, []);
    }

    groups.get(group).push(report);
  });

  const sortedGroups = [];
  Array.from(groups.keys()).sort().forEach(group => {
    const reports = groups.get(group);
    reports.sort((a, b) => a.name < b.name ? -1 : 1);
    sortedGroups.push({name: group, reports});
  });

  console.log(sortedGroups)

  return sortedGroups;
}
