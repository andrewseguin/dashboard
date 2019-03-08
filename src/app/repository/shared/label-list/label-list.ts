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

interface DisplayedLabel {
  id: number;
  name: string;
  textColor: string;
  borderColor: string;
  backgroundColor: string;
}

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
                       console.log('updating labels');
                       const labelIds = result[0] as (string | number)[];
                       const repo = result[1] as Repo;

                       const labels: DisplayedLabel[] = [];
                       labelIds.forEach(labelId => {
                         const label = repo.labelsMap.get(labelId);
                         labels.push(convertLabelToDisplayedLabel(label));
                       });
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

function convertLabelToDisplayedLabel(label: Label): DisplayedLabel {
  return {
    id: label.id,
    name: label.name,
    textColor: getTextColor(label.color),
    borderColor: getBorderColor(label.color),
    backgroundColor: '#' + label.color,
  };
}

function getTextColor(color: string) {
  const R = parseInt(color.slice(0, 2), 16);
  const G = parseInt(color.slice(2, 4), 16);
  const B = parseInt(color.slice(4, 6), 16);

  return (R * 0.299 + G * 0.587 + B * 0.114) > 186 ? 'black' : 'white';
}

function getBorderColor(color: string) {
  let R = (Math.max(parseInt(color.slice(0, 2), 16) * .6, 16)).toString(16).slice(0, 2);
  let G = (Math.max(parseInt(color.slice(2, 4), 16) * .6, 16)).toString(16).slice(0, 2);
  let B = (Math.max(parseInt(color.slice(4, 6), 16) * .6, 16)).toString(16).slice(0, 2);

  return '#' + R + G + B;
}
