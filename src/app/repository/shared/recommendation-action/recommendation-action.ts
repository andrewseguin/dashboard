import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ActiveRepo} from 'app/repository/services/active-repo';
import {Item, Label} from 'app/repository/services/dao';
import {Recommendation} from 'app/repository/services/dao/recommendation';
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

  constructor(private github: Github, private activeRepo: ActiveRepo) {}

  addLabel(label: Label) {
    const newItem: Item = {...this.item};
    newItem.labels = [...this.item.labels, +label.id];
    this.activeRepo.activeStore.items.update(newItem);
    this.github.addLabel(this.activeRepo.activeRepository, this.item.id, label.name)
        .pipe(take(1))
        .subscribe();
  }

  addAssignee(assignee: string) {
    const newItem: Item = {...this.item};
    newItem.assignees = [...this.item.assignees, assignee];
    this.activeRepo.activeStore.items.update(newItem);
    this.github.addAssignee(this.activeRepo.activeRepository, this.item.id, assignee)
        .pipe(take(1))
        .subscribe();
  }
}
