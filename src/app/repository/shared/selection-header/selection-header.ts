import {animate, state, style, transition, trigger} from '@angular/animations';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {Selection} from 'app/repository/services';
import {merge, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

export type SelectionType = 'request'|'item';

@Component({
  selector: 'selection-header',
  templateUrl: 'selection-header.html',
  styleUrls: ['selection-header.scss'],
  host: {
    '[style.display]': 'none',
    '[class.mat-elevation-z1]': 'true',
    '[@state]': 'getSelectionState()'
  },
  animations: [trigger(
      'state',
      [
        state('void, none', style({transform: 'translateY(-110%)'})),
        state('selected', style({transform: 'translateY(0%)'})),
        transition(
            'void => selected, none <=> selected',
            [animate('350ms cubic-bezier(0.35, 0, 0.25, 1)')]),
      ])],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectionHeader {
  private destroyed = new Subject();

  constructor(private selection: Selection, private cd: ChangeDetectorRef) {
    merge(
        this.selection.issues.changed, this.selection.selectableB.changed)
        .pipe(takeUntil(this.destroyed))
        .subscribe(() => this.cd.markForCheck());
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  getSelectionState() {
    return this.getSelectionCount() > 0 ? 'selected' : 'none';
  }

  getSelectionCount() {
    return this.selection.issues.selected.length ||
        this.selection.selectableB.selected.length;
  }

  getSelectionType(): SelectionType {
    if (this.selection.issues.selected.length) {
      return 'request';
    } else if (this.selection.selectableB.selected.length) {
      return 'item';
    }

    return null;
  }

  clearSelection() {
    this.selection.issues.clear();
    this.selection.selectableB.clear();
  }
}
