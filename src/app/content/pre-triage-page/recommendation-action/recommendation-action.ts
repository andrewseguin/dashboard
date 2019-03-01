import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {Recommendation} from 'app/content/services/issue-recommendations';
import {Issue} from 'app/service/github';
import {RepoDao} from 'app/service/repo-dao';

@Component({
  selector: 'recommendation-action',
  styleUrls: ['recommendation-action.scss'],
  templateUrl: 'recommendation-action.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationAction {
  @Input() issue: Issue;

  @Input() recommendation: Recommendation;

  constructor(private repoDao: RepoDao, private cd: ChangeDetectorRef) {
    this.repoDao.repo.subscribe(repo => {

    });
  }

  addLabel(labelId: number) {
    // TODO: Send to github
    this.issue.labels = [...this.issue.labels, labelId];
  }
}
