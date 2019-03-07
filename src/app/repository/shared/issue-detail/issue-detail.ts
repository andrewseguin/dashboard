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
import {
  CombinedPagedResults,
  Github,
  GithubTimelineEvent,
  TimelineEvent,
  UserComment
} from 'app/service/github';
import {RepoDao} from 'app/service/repo-dao';
import {combineLatest, Observable, Subject} from 'rxjs';
import {filter, map} from 'rxjs/operators';

export interface Activity {
  type: 'comment'|'timeline';
  date: string;
  context: UserComment|GithubTimelineEvent;
}
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

  activity: Observable<Activity[]>;

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

      const activityRequests = [
        this.github.getComments(this.activatedRepository.repository.value, this.issueId),
        this.github.getTimeline(this.activatedRepository.repository.value, this.issueId)
      ];

      this.activity =
          combineLatest(...activityRequests)
              .pipe(
                  filter(result => {
                    const commentsResult = result[0] as CombinedPagedResults<UserComment>;
                    const timelineResult = result[1] as CombinedPagedResults<TimelineEvent>;

                    const commentsFinished = commentsResult.completed === commentsResult.total;
                    const timelineFinished = timelineResult.completed === timelineResult.total;
                    return commentsFinished && timelineFinished;
                  }),
                  map(result => {
                    const comments = result[0].current as UserComment[];
                    const timeline = result[1].current as GithubTimelineEvent[];

                    const activity: Activity[] = [];
                    comments.forEach(
                        c => activity.push({type: 'comment', date: c.created, context: c}));
                    timeline.forEach(
                        e => activity.push({type: 'timeline', date: e.created_at, context: e}));
                    return activity;
                  }));
    }
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
