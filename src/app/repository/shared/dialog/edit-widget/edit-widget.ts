import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {IssuesFilterMetadata} from 'app/repository/services/issues-renderer/issues-filter-metadata';
import {Filter} from 'app/repository/utility/search/filter';
import {Observable, Subject} from 'rxjs';

export interface EditWidgetData {
  name: Observable<string>;
  warning?: Observable<string>;
}

export interface EditWidgetResult {}

@Component({
  templateUrl: 'edit-widget.html',
  styleUrls: ['edit-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditWidget {
  set filters(v: Filter[]) {
    if (this._filters === v) {
      return;
    }
    this._filters = v;
    this.queryChanged.next();
  }
  get filters(): Filter[] {
    return this._filters;
  }
  private _filters: Filter[] = [];

  set search(v: string) {
    if (this._search === v) {
      return;
    }
    this._search = v;
    this.queryChanged.next();
  }
  get search(): string {
    return this._search;
  }
  private _search = '';

  queryChanged = new Subject<void>();

  name = this.data.name;

  form: FormGroup;

  metadata = IssuesFilterMetadata;

  constructor(
      private dialogRef: MatDialogRef<EditWidget, EditWidgetResult>,
      @Inject(MAT_DIALOG_DATA) public data: EditWidgetData) {
    this.form = new FormGroup({
      name: new FormControl(this.data.name),
    });
  }

  edit() {
    this.dialogRef.close({name: 'New widget'});
  }
}
