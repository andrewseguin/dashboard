import {query} from '@angular/animations';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {IssueRecommendations} from 'app/repository/services/issue-recommendations';
import {IssuesRenderer} from 'app/repository/services/issues-renderer/issues-renderer';
import {Item} from 'app/service/github';
import {Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'item-summary',
  templateUrl: 'item-summary.html',
  styleUrls: ['item-summary.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'(click)': 'select.emit(this.item.number)'}
})
export class ItemSummary {
  warnings = this.itemRecommendations.recommendations.pipe(
      map(map => this.item ? map.get(this.item.number).filter(r => r.type === 'warning') : null));
  suggestions = this.itemRecommendations.recommendations.pipe(map(
      map => this.item ? map.get(this.item.number).filter(r => r.type === 'suggestion') : null));

  private destroyed = new Subject();

  @Input() item: Item;

  @Input() active: boolean;

  @Output()
  select = new EventEmitter<number>()

      constructor(
          private activatedRoute: ActivatedRoute, public itemRecommendations: IssueRecommendations,
          private cd: ChangeDetectorRef, public itemsRenderer: IssuesRenderer,
          private router: Router) {
    this.itemsRenderer.options.changed.pipe(takeUntil(this.destroyed))
        .subscribe(() => this.cd.markForCheck());
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
