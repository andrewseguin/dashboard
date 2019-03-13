import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ActivatedRepository} from 'app/repository/services/activated-repository';
import {Item, ItemsDao, Label} from 'app/repository/services/dao';
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

  constructor(
      private itemsDao: ItemsDao, private github: Github,
      private activatedRepository: ActivatedRepository) {}

  addLabel(label: Label) {
    const newItem: Item = {...this.item};
    newItem.labels = [...this.item.labels, +label.id];
    this.itemsDao.update(newItem);

    this.activatedRepository.repository.pipe(filter(v => !!v), take(1)).subscribe(repository => {
      this.github.addLabel(repository!, this.item.id, label.name).subscribe(result => {
        console.log(result);
      });
    });
  }

  addAssignee(assignee: string) {
    const newItem: Item = {...this.item};
    newItem.assignees = [...this.item.assignees, assignee];
    this.itemsDao.update(newItem);

    this.activatedRepository.repository.pipe(filter(v => !!v), take(1)).subscribe(repository => {
      this.github.addAssignee(repository!, this.item.id, assignee).subscribe(result => {
        console.log(result);
      });
    });
  }
}
