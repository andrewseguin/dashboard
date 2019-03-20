import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ActiveStore} from 'app/repository/services/active-store';
import {Item, Label} from 'app/repository/services/dao';
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

  constructor(private github: Github, private activeStore: ActiveStore) {}

  addLabel(label: Label) {
    const newItem: Item = {...this.item};
    newItem.labels = [...this.item.labels, +label.id];
    this.activeStore.activeData.items.update(newItem);
    this.github.addLabel(this.activeStore.activeName, this.item.id, label.name)
        .pipe(take(1))
        .subscribe();
  }

  addAssignee(assignee: string) {
    const newItem: Item = {...this.item};
    newItem.assignees = [...this.item.assignees, assignee];
    this.activeStore.activeData.items.update(newItem);
    this.github.addAssignee(this.activeStore.activeName, this.item.id, assignee)
        .pipe(take(1))
        .subscribe();
  }
}
