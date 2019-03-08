import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges
} from '@angular/core';
import {Label} from 'app/service/github';
import {Repo, RepoDao} from 'app/service/repo-dao';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {filter, map} from 'rxjs/operators';

@Component({
  selector: 'label-list',
  styleUrls: ['label-list.scss'],
  templateUrl: 'label-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelList {
  /** Label identification either by id or name */
  @Input()
  set labelIds(labelIds: (string|number)[]) {
    this._labelIds.next(labelIds);
  };
  _labelIds = new BehaviorSubject<(string | number)[]>([]);

  /** Whether the labels are a selection list */
  @Input() selectable: boolean;

  @Output() selected = new EventEmitter<number>();

  labels = combineLatest(this._labelIds, this.repoDao.repo)
               .pipe(filter(result => !!result[0] && !!result[1]), map(result => {
                       const labelIds = result[0] as (string | number)[];
                       const repo = result[1] as Repo;

                       const labels: Label[] = [];
                       labelIds.forEach(labelId => labels.push(repo.labelsMap.get(labelId)));
                       labels.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
                       return labels;
                     }));

  constructor(public repoDao: RepoDao, private cd: ChangeDetectorRef) {}

  select(labelId: number) {
    if (this.selectable) {
      this.selected.emit(labelId);
    }
  }
}
