import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {GithubItemGroupsDataSource} from 'app/repository/services/github-item-groups-data-source';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ConfigOption} from '../../edit-widget/widget-type-options/widget-type-options';

export interface CountDisplayTypeOptions {
  fontSize: 'small'|'normal'|'large';
}

export function getCountConfigOptions(options: CountDisplayTypeOptions): ConfigOption[] {
  return [
    {
      id: 'fontSize',
      type: 'input',
      label: 'Font Size (px)',
      inputType: 'number',
      initialValue: options ? options.fontSize || '16' : null,
    },
  ];
}

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
