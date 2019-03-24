import {ChangeDetectionStrategy, Component, ElementRef, Input, SimpleChanges} from '@angular/core';
import {SafeHtml} from '@angular/platform-browser';
import {Item} from 'app/github/app-types/item';
import {ActiveStore} from 'app/repository/services/active-store';
import {Recommendation} from 'app/repository/services/dao/config/recommendation';
import {Dao} from 'app/repository/services/dao/data-dao';
import {ItemRecommendations} from 'app/repository/services/item-recommendations';
import {Markdown} from 'app/repository/services/markdown';
import {Github, TimelineEvent, UserComment} from 'app/service/github';
import {combineLatest, Observable, Subject} from 'rxjs';
import {filter, map, mergeMap} from 'rxjs/operators';

export interface Activity {
  type: 'comment'|'timeline';
  date: string;
  context: UserComment|TimelineEvent;
}
@Component({
  selector: 'item-detail',
  styleUrls: ['item-detail.scss'],
  templateUrl: 'item-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemDetail {
  bodyMarkdown: Observable<SafeHtml>;

  recommendations: Observable<Recommendation[]>;

  comments: Observable<any[]>;

  activities: Observable<Activity[]>;

  @Input() itemId: string;

  item: Observable<Item|null>;

  private destroyed = new Subject();

  constructor(
      private elementRef: ElementRef, private markdown: Markdown, public activeRepo: ActiveStore,
      public github: Github, private itemRecommendations: ItemRecommendations, public dao: Dao) {}

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['itemId'] && this.itemId) {
      this.elementRef.nativeElement.scrollTop = 0;  // Scroll up in case prev item was scrolled
      this.itemId = `${this.itemId}`;  // Make sure its a string since maps are string-ID based
      const store = this.dao.get(this.activeRepo.activeName);
      this.item = store.items.get(this.itemId);
      this.bodyMarkdown = this.markdown.getItemBodyMarkdown(store, this.itemId);
      this.recommendations = this.itemRecommendations.allRecommendations.pipe(
          map(recommendations => recommendations.get(this.itemId) || []));

      this.activities = this.activeRepo.data.pipe(
          mergeMap(dataStore => {
            return combineLatest(
                this.github.getComments(dataStore.name!, this.itemId),
                this.github.getTimeline(dataStore.name!, this.itemId));
          }),
          filter(result => {
            const commentsResult = result[0];
            const timelineResult = result[1];

            const commentsFinished = commentsResult.completed === commentsResult.total;
            const timelineFinished = timelineResult.completed === timelineResult.total;
            return commentsFinished && timelineFinished;
          }),
          map(result => {
            const comments = result[0].accumulated as UserComment[];

            const filteredTimelineEvents = new Set(['mentioned', 'subscribed', 'referenced']);
            const timelineEvents =
                (result[1].accumulated as TimelineEvent[])
                    .filter(timelineEvent => !filteredTimelineEvents.has(timelineEvent.type));

            const activities: Activity[] = [];
            comments.forEach(c => activities.push({type: 'comment', date: c.created, context: c}));
            timelineEvents.forEach(
                e => activities.push({type: 'timeline', date: e.created, context: e}));
            activities.sort((a, b) => a.date < b.date ? -1 : 1);

            return activities;
          }));
    }
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
