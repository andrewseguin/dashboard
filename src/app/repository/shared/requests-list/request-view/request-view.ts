import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {RequestsRenderer} from 'app/repository/services/requests-renderer/requests-renderer';
import {Issue} from 'app/service/github';
import {Subject} from 'rxjs';

@Component({
  selector: 'request',
  templateUrl: 'request-view.html',
  styleUrls: ['request-view.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'(click)': 'selectIssue()'}
})
export class RequestView implements OnInit {
  private destroyed = new Subject();

  @Input() issue: Issue;

  constructor(
      private activatedRoute: ActivatedRoute,
      public requestsRenderer: RequestsRenderer, private router: Router) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  selectIssue() {
    this.router.navigate(
        [this.issue.number], {relativeTo: this.activatedRoute});
  }
}
