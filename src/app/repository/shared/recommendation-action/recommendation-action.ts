import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {Recommendation} from 'app/repository/services/dao/recommendations-dao';
import {Github, Item} from 'app/service/github';
import {RepoDao} from 'app/service/repo-dao';

@Component({
  selector: 'recommendation-action',
  styleUrls: ['recommendation-action.scss'],
  templateUrl: 'recommendation-action.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationAction {
  @Input() item: Item;

  @Input() recommendation: Recommendation;

  constructor(private repoDao: RepoDao, private cd: ChangeDetectorRef, private github: Github) {}

  addLabel(labelId: number) {
    // TODO: Send to github
    const newIssue = {...this.item};
    newIssue.labels = [...this.item.labels, labelId];

    this.repoDao.setItems([newIssue]);
  }
}
