import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, SimpleChanges} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {Issue, Label} from 'app/service/github';
import {RepoDao} from 'app/service/repo-dao';
import * as hljs from 'highlight.js';
import * as Remarkable from 'remarkable';

interface AssignmentRecommendation {
  action: 'assign';
  assignee: string;
}

type Recommendation = AssignmentRecommendation;

@Component({
  selector: 'issue-detail',
  styleUrls: ['issue-detail.scss'],
  templateUrl: 'issue-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueDetail {
  bodyMarkdown: SafeHtml;

  @Input() issue: Issue;

  priorityLabels: Label[] = [];

  md = new Remarkable({
    html: true,
    breaks: true,
    linkify: true,
    highlight:
        function(str, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(lang, str).value;
            } catch (err) {
            }
          }

          try {
            return hljs.highlightAuto(str).value;
          } catch (err) {
          }

          return '';  // use external default escaping
        }
  });

  constructor(
      private repoDao: RepoDao, private cd: ChangeDetectorRef,
      private sanitizer: DomSanitizer) {
        this.repoDao.repo.subscribe(repo => {
          if (repo) {
            this.priorityLabels = [];

            repo.labels.forEach(label => {
              if (['P0', 'P1', 'P2', 'P3', 'P4', 'P5'].indexOf(label.name) !== -1) {
                this.priorityLabels.push(label);
              }
            });

            this.priorityLabels.sort();
          }
        })
      }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['issue']) {
      this.bodyMarkdown = this.sanitizer.bypassSecurityTrustHtml(
          this.md.render(this.issue.body));
    }
  }

  getRecommendations(issue: Issue): Recommendation[] {
    const recommendations = [];

    if (issue.title.indexOf('table') !== -1 ||
        issue.body.indexOf('table') !== -1) {
      recommendations.push({action: 'assign', assignee: 'andrewseguin'});
    }

    return recommendations;
  }
}
