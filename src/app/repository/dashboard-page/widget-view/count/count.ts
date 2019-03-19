import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CountDisplayTypeOptions} from 'app/repository/services/dao';
import {GithubItemsRenderer} from 'app/repository/services/github-items-renderer';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'count',
  templateUrl: 'count.html',
  styleUrls: ['count.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Count {
  @Input() itemsRenderer: GithubItemsRenderer;

  @Input() options: CountDisplayTypeOptions;

  count: Observable<number>;

  ngOnInit() {
    this.count = this.itemsRenderer.connect().pipe(map(result => result.count));
  }
}
