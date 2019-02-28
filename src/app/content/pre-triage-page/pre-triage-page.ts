import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {Issue, Label} from 'app/service/github';
import {RepoDao} from 'app/service/repo-dao';

interface AssignmentRecommendation {
  action: 'assign';
  assignee: string;
}

type Recommendation = AssignmentRecommendation;

interface PreTriageIssue {
  issue: Issue;
  recommendations: Recommendation[];
}

@Component({
  styleUrls: ['pre-triage-page.scss'],
  templateUrl: 'pre-triage-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreTriagePage {
  preTriageIssues: PreTriageIssue[] = [];

  trackByNumber = (_i, preTriageIssue: PreTriageIssue) => preTriageIssue.issue.number;

  constructor(private repoDao: RepoDao, private cd: ChangeDetectorRef) {
    this.repoDao.repo.subscribe(repo => {
      if (!repo) {
        return;
      }

      const labels = new Map<number, Label>();
      repo.labels.forEach(label => labels.set(label.id, label));

      const priorityLabels = ['P0', 'P1', 'P2', 'P3', 'P4', 'P5'];
      this.preTriageIssues =
          repo.issues
              .filter(issue => {
                const isIssue = !issue.pr;
                const hasPriority = issue.labels.some(label => {
                  return priorityLabels.indexOf(labels.get(+label).name) != -1;
                });

                return isIssue && !hasPriority;
              })
              .map(issue => {
                const recommendations = this.getRecommendations(issue);

                return {
                  issue, recommendations
                }
              });

      this.cd.markForCheck();
    });
  }

  getRecommendations(issue: Issue): Recommendation[] {
    const recommendations = [];

    if (issue.title.indexOf('table') !== -1 || issue.body.indexOf('table') !== -1) {
      recommendations.push({action: 'assign', assignee: 'andrewseguin'});
    }

    return recommendations;
  }
}
