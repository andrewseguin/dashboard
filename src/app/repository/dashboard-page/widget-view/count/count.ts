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
      initialValue: options && options.fontSize ? options.fontSize : '48',
    },
  ];
}

@Component({
  selector: 'count',
  template: `{{count | async}}`,
  styles: [`
    :host {
      display: block;
      text-align: center;
      padding: 24px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.fontSize.px]': 'options.fontSize',
  }
})
export class Count {
  @Input() itemGroupsDataSource: GithubItemGroupsDataSource;

  @Input() options: CountDisplayTypeOptions;

  count: Observable<number>;

  ngOnInit() {
    this.count = this.itemGroupsDataSource.connect().pipe(map(result => result.count));
  }
}
