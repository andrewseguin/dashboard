import {ChangeDetectionStrategy, Component, Input, SimpleChanges} from '@angular/core';
import {SafeHtml} from '@angular/platform-browser';
import {IssueRecommendations, Recommendation} from 'app/content/services/issue-recommendations';
import {Markdown} from 'app/content/services/markdown';
import {Issue} from 'app/service/github';
import {Observable, Subscription} from 'rxjs';
import {RepoDao} from 'app/service/repo-dao';

@Component({
  selector: 'issue-detail',
  styleUrls: ['issue-detail.scss'],
  templateUrl: 'issue-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueDetail {
  @Input() issueId: number;

  bodyMarkdown: Observable<SafeHtml>;

  recommendations: Observable<Recommendation[]>;

  constructor(
    private markdown: Markdown, private repoDao: RepoDao,
    private issueRecommendations: IssueRecommendations) {}

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['issueId'] && this.issueId) {
      this.bodyMarkdown = this.markdown.getIssueBodyMarkdown(this.issueId);
      this.recommendations = this.issueRecommendations.get(this.issueId);
    }
  }
}
