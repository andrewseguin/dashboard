import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  styleUrls: ['another-page.scss'],
  templateUrl: 'another-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnotherPage {
  constructor() {}
}
