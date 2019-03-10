import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Item, ItemsDao} from 'app/repository/services/dao';
import {Recommendation} from 'app/repository/services/dao/recommendations-dao';

@Component({
  selector: 'recommendation-action',
  styleUrls: ['recommendation-action.scss'],
  templateUrl: 'recommendation-action.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationAction {
  @Input() item: Item;

  @Input() recommendation: Recommendation;

  constructor(private itemsDao: ItemsDao) {}

  addLabel(labelId: string) {
    // TODO: Send to github
    const newItem: Item = {...this.item};
    newItem.labels = [...this.item.labels, labelId];
    this.itemsDao.update(this.item.id, newItem);
  }
}
