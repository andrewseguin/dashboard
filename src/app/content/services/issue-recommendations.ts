import {Injectable} from "@angular/core";
import {Issue, Label} from "app/service/github";
import {Repo, RepoDao} from "app/service/repo-dao";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

export interface AssignmentRecommendation {
  action: 'assign';
  assignee: string;
}

export interface LabelRecommendation {
  icon: string;
  labels: number[];
  message: string;
  warn?: boolean;
}

export type Recommendation = AssignmentRecommendation | LabelRecommendation;

@Injectable()
export class IssueRecommendations {
  constructor(private repoDao: RepoDao) {}

  get(issueId: number): Observable<Recommendation[] | any> {
    return this.repoDao.repo.pipe(map(repo => {
      let issue: Issue;
      for (let i of repo.issues) {
        if (i.number === issueId) {
          issue = i;
          break;
        }
      }

      return this.getRecommendations(issue, repo);
    }));
  }

  getRecommendations(issue: Issue, repo: Repo): Recommendation[] {
    if (!issue || !repo) {
      return [];
    }


    const recommendations = [];

    // Need priority
    const priorityLabels = getPriorityLabels(repo.labels);
    const needsPriority = !issue.labels.some(label => {
      return priorityLabels.indexOf(label) !== -1;
    });
    if (needsPriority) {
      recommendations.push({
        message: 'This issue is missing a priority',
        labels: priorityLabels,
        icon: 'warning',
        warn: true,
      });
    }

    // Could use docs label
    const mentionsDocs = (issue.title + issue.body).indexOf('docs') !== -1;
    let docsLabel: number;
    repo.labels.forEach(label => {
      if (label.name === 'docs') {
        docsLabel = label.id;
      }
    })
    if (mentionsDocs && docsLabel &&
      issue.labels.indexOf(docsLabel) === -1) {
      recommendations.push({
        message: 'This issue mentions documentation. Apply docs label?',
        labels: [docsLabel],
        icon: 'label_important'
      });
    }

    return recommendations;
  }
}

function getPriorityLabels(labels: Label[]): number[] {
  const priorityLabels: Label[] = [];

  labels.forEach(label => {
    if (['P0', 'P1', 'P2', 'P3', 'P4', 'P5'].indexOf(label.name) !== -1) {
      priorityLabels.push(label);
    }
  });

  priorityLabels.sort((a, b) => a.name < b.name ? -1 : 1);
  return priorityLabels.map(label => label.id);
}
