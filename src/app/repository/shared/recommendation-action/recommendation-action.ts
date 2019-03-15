import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ActiveRepo} from 'app/repository/services/active-repo';
import {Item, Label} from 'app/repository/services/dao';
import {Dao} from 'app/repository/services/dao/dao';
import {Recommendation} from 'app/repository/services/dao/recommendations-dao';
import {Github} from 'app/service/github';
import {filter, take} from 'rxjs/operators';

@Component({
  selector: 'recommendation-action',
  styleUrls: ['recommendation-action.scss'],
  templateUrl: 'recommendation-action.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationAction {
  @Input() item: Item;

  @Input() recommendation: Recommendation;

  constructor(private dao: Dao, private github: Github, private activeRepo: ActiveRepo) {}

  addLabel(label: Label) {
    const newItem: Item = {...this.item};
    newItem.labels = [...this.item.labels, +label.id];
    this.dao.items.update(newItem);

    this.activeRepo.repository.pipe(filter(v => !!v), take(1)).subscribe(repository => {
      this.github.addLabel(repository!, this.item.id, label.name).subscribe(result => {
        console.log(result);
      });
    });
  }

  addAssignee(assignee: string) {
    const newItem: Item = {...this.item};
    newItem.assignees = [...this.item.assignees, assignee];
    this.dao.items.update(newItem);

    this.activeRepo.repository.pipe(filter(v => !!v), take(1)).subscribe(repository => {
      this.github.addAssignee(repository!, this.item.id, assignee).subscribe(result => {
        console.log(result);
      });
    });
  }
}
