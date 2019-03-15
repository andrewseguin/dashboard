import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ActiveRepo} from 'app/repository/services/active-repo';
import {Remover} from 'app/repository/services/remover';
import {RepoDaoType} from 'app/repository/services/repo-load-state';
import {Updater} from 'app/repository/services/updater';
import {BehaviorSubject} from 'rxjs';

export type UpdateState = 'not-updating'|'updating'|'updated';

@Component({
  selector: 'type-actions',
  styleUrls: ['type-actions.scss'],
  templateUrl: 'type-actions.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypeActions {
  @Input() type: RepoDaoType;

  updateState = new BehaviorSubject<UpdateState>('not-updating');

  constructor(private updater: Updater, public remover: Remover, private activeRepo: ActiveRepo) {}

  update() {
    this.updateState.next('updating');
    this.updater.update(this.activeRepo.repository, this.type)
        .then(() => this.updateState.next('updated'));
  }
}
