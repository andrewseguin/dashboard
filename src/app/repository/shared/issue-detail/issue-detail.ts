import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  SimpleChanges
} from '@angular/core';
import {SafeHtml} from '@angular/platform-browser';
import {ActivatedRepository} from 'app/repository/services/activated-repository';
import {Recommendation} from 'app/repository/services/dao/recommendations-dao';
import {IssueRecommendations} from 'app/repository/services/issue-recommendations';
import {Markdown} from 'app/repository/services/markdown';
import {Github} from 'app/service/github';
import {RepoDao} from 'app/service/repo-dao';
import {Observable, Subject} from 'rxjs';
import {filter, map} from 'rxjs/operators';

@Component({
  selector: 'issue-detail',
  styleUrls: ['issue-detail.scss'],
  templateUrl: 'issue-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueDetail {
  bodyMarkdown: Observable<SafeHtml>;

  recommendations: Observable<Recommendation[]>;

  comments: Observable<any[]>;

  @Input() issueId: number;

  private destroyed = new Subject();

  constructor(
      private markdown: Markdown, public repoDao: RepoDao, private cd: ChangeDetectorRef,
      public activatedRepository: ActivatedRepository, public github: Github,
      private issueRecommendations: IssueRecommendations) {}

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['issueId'] && this.issueId) {
      this.bodyMarkdown = this.markdown.getIssueBodyMarkdown(this.issueId);
      this.recommendations = this.issueRecommendations.recommendations.pipe(
          filter(r => !!r), map(recommendations => recommendations.get(this.issueId)));
      this.comments =
          this.github.getComments(this.activatedRepository.repository.value, this.issueId)
              .pipe(map(results => {
                if (results.completed === results.total) {
                  return results.current;
                }
              }));
    }
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
