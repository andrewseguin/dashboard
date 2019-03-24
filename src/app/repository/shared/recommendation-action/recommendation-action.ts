import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Item} from 'app/github/app-types/item';
import {Label} from 'app/github/app-types/label';
import {ActiveStore} from 'app/repository/services/active-store';
import {Recommendation} from 'app/repository/services/dao/config/recommendation';
import {Github} from 'app/service/github';
import {take} from 'rxjs/operators';

@Component({
  selector: 'recommendation-action',
  styleUrls: ['recommendation-action.scss'],
  templateUrl: 'recommendation-action.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationAction {
  @Input() item: Item;

  @Input() recommendation: Recommendation;

  constructor(private github: Github, private activeRepo: ActiveStore) {}

  addLabel(label: Label) {
    const newItem: Item = {...this.item};
    newItem.labels = [...this.item.labels, +label.id];
    this.activeRepo.activeData.items.update(newItem);
    this.github.addLabel(this.activeRepo.activeName, this.item.id, label.name)
        .pipe(take(1))
        .subscribe();
  }

  addAssignee(assignee: string) {
    const newItem: Item = {...this.item};
    newItem.assignees = [...this.item.assignees, assignee];
    this.activeRepo.activeData.items.update(newItem);
    this.github.addAssignee(this.activeRepo.activeName, this.item.id, assignee)
        .pipe(take(1))
        .subscribe();
  }
}
