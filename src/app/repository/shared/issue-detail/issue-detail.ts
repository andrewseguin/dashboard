import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  SimpleChanges
} from '@angular/core';
import {SafeHtml} from '@angular/platform-browser';
import {Recommendation} from 'app/repository/services/dao/recommendations-dao';
import {IssueRecommendations} from 'app/repository/services/issue-recommendations';
import {Markdown} from 'app/repository/services/markdown';
import {RepoDao} from 'app/service/repo-dao';
import {Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'issue-detail',
  styleUrls: ['issue-detail.scss'],
  templateUrl: 'issue-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueDetail {
  bodyMarkdown: Observable<SafeHtml>;

  recommendations: Observable<Recommendation[]>;

  @Input() issueId: number;

  private destroyed = new Subject();

  constructor(
      private markdown: Markdown, public repoDao: RepoDao, private cd: ChangeDetectorRef,
      private issueRecommendations: IssueRecommendations) {}

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['issueId'] && this.issueId) {
      this.bodyMarkdown = this.markdown.getIssueBodyMarkdown(this.issueId);
      this.recommendations = this.issueRecommendations.recommendations.pipe(
          map(recommendations => recommendations.get(this.issueId)));
    }
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
