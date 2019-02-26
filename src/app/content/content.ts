import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  templateUrl: 'content.html',
  styleUrls: ['content.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Content {
}
