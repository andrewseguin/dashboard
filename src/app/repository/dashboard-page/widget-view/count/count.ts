import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CountDisplayTypeOptions} from 'app/repository/services/dao';
import {GithubItemGroupsDataSource} from 'app/repository/services/github-item-groups-data-source';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'count',
  templateUrl: 'count.html',
  styleUrls: ['count.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Count {
  @Input() itemGroupsDataSource: GithubItemGroupsDataSource;

  @Input() options: CountDisplayTypeOptions;

  count: Observable<number>;

  ngOnInit() {
    this.count = this.itemGroupsDataSource.connect().pipe(map(result => result.count));
  }
}
