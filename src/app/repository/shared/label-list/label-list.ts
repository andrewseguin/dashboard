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
  /** Label identification either by id or name */
  @Input() labelIds: string[]|number[];

  /** Whether the labels are a selection list */
  @Input() selectable: boolean;

  @Output() selected = new EventEmitter<number>();

  constructor(public repoDao: RepoDao, private cd: ChangeDetectorRef) {}

  select(labelId: number) {
    if (this.selectable) {
      this.selected.emit(labelId);
    }
  }
}
