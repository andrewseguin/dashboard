import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

export type UpdateState = 'not-updating'|'updating'|'updated';

@Component({
  selector: 'update-button',
  styleUrls: ['update-button.scss'],
  templateUrl: 'update-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateButton {
  @Input() updateState: UpdateState;

  @Output() update = new EventEmitter<void>();
}
