import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {Label} from 'app/service/github';
import {RepoDao} from 'app/service/repo-dao';

@Component({
  selector: 'label-list',
  styleUrls: ['label-list.scss'],
  templateUrl: 'label-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelList {
  @Input() labelIds: Label[];

  /** Whether the labels are a selection list */
  @Input() selectable: boolean;

  @Output() selected = new EventEmitter<number>();

  labels = new Map<number, Label>();

  constructor(private repoDao: RepoDao, private cd: ChangeDetectorRef) {
    this.repoDao.repo.subscribe(repo => {
      if (repo) {
        repo.labels.forEach(label => this.labels.set(label.id, label));
        this.cd.markForCheck();
      }
    });
  }

  select(labelId: number) {
    if (this.selectable) {
      this.selected.emit(labelId);
    }
  }
}
