import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {Label, LabelsDao} from 'app/repository/services/dao';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {filter, map} from 'rxjs/operators';

interface DisplayedLabel {
  id: string;
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
  set labelIds(labelIds: string[]) {
    this._labelIds.next(labelIds);
  }
  _labelIds = new BehaviorSubject<string[]>([]);

  /** Whether the labels are a selection list */
  @Input() selectable: boolean;

  @Output() selected = new EventEmitter<number>();

  labels = combineLatest(this._labelIds, this.labelsDao.list)
               .pipe(filter(result => result.every(r => !!r)), map(result => {
                       const labelIds = result[0];

                       const labelsMap = new Map<string, Label>();
                       result[1]!.forEach(label => {
                         labelsMap.set(label.id, label);
                         labelsMap.set(label.name, label);
                       });

                       const labels: DisplayedLabel[] = [];
                       labelIds.forEach(labelId => {
                         const label = labelsMap.get(`${labelId}`);
                         if (label) {  // labels may be applied but no longer exist
                           labels.push(convertLabelToDisplayedLabel(label));
                         }
                       });
                       labels.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
                       return labels;
                     }));

  constructor(private labelsDao: LabelsDao) {}

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
