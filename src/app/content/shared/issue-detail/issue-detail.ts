import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {SafeHtml} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';
import {IssueRecommendations, Recommendation} from 'app/content/services/issue-recommendations';
import {Markdown} from 'app/content/services/markdown';
import {RepoDao} from 'app/service/repo-dao';
import {Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'issue-detail',
  styleUrls: ['issue-detail.scss'],
  templateUrl: 'issue-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueDetail {
  issueId: number;

  bodyMarkdown: Observable<SafeHtml>;

  recommendations: Observable<Recommendation[]>;

  private destroyed = new Subject();

  constructor(
      private activatedRoute: ActivatedRoute, private markdown: Markdown,
      private repoDao: RepoDao, private cd: ChangeDetectorRef,
      private issueRecommendations: IssueRecommendations) {
    this.activatedRoute.params.pipe(takeUntil(this.destroyed))
        .subscribe(params => {
          this.issueId = +params['id'];
          this.bodyMarkdown = this.markdown.getIssueBodyMarkdown(this.issueId);
          this.recommendations = this.issueRecommendations.get(this.issueId);
          this.cd.markForCheck();
        });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
