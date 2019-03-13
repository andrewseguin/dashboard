import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'new-fab',
  templateUrl: 'new-fab.html',
  styleUrls: ['new-fab.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewFab {
  @Input() type: string;
  @Input() breathing: boolean;
}
