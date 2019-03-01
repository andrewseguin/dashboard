import {ChangeDetectionStrategy, Component, Input, SimpleChanges} from '@angular/core';
import {SafeHtml} from '@angular/platform-browser';
import {IssueRecommendations, Recommendation} from 'app/content/services/issue-recommendations';
import {Markdown} from 'app/content/services/markdown';
import {Issue} from 'app/service/github';
import {Observable} from 'rxjs';

@Component({
  selector: 'issue-detail',
  styleUrls: ['issue-detail.scss'],
  templateUrl: 'issue-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueDetail {
  bodyMarkdown: SafeHtml;

  @Input() issue: Issue;

  recommendations: Observable<Recommendation[]>;

  constructor(
    private markdown: Markdown,
    private issueRecommendations: IssueRecommendations) {}

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['issue'] && this.issue) {
      this.bodyMarkdown = this.markdown.render(this.issue.body);
      this.recommendations = this.issueRecommendations.get(this.issue.number);
    }
  }
}
