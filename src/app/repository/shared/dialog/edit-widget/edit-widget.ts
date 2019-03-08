import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Widget} from 'app/repository/services/dao/dashboards-dao';
import {ItemsFilterMetadata} from 'app/repository/services/issues-renderer/issues-filter-metadata';
import {IssuesRenderer} from 'app/repository/services/issues-renderer/issues-renderer';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

export interface EditWidgetData {
  widget: Widget;
}

@Component({
  templateUrl: 'edit-widget.html',
  styleUrls: ['edit-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [IssuesRenderer]
})
export class EditWidget {
  widget: Widget;

  queryChanged = new Subject<void>();

  form: FormGroup;

  metadata = ItemsFilterMetadata;

  private _destroyed = new Subject();

  constructor(
      private dialogRef: MatDialogRef<EditWidget, Widget>, public issuesRenderer: IssuesRenderer,
      private cd: ChangeDetectorRef, @Inject(MAT_DIALOG_DATA) public data: EditWidgetData) {
    this.widget = {...data.widget};
    this.issuesRenderer.initialize(this.widget.itemType);
    this.issuesRenderer.options.setState(data.widget.options);
    this.form = new FormGroup({
      title: new FormControl(this.widget.title),
      itemType: new FormControl(this.widget.itemType),
      displayType: new FormControl(this.widget.displayType),
      listLength: new FormControl(this.widget.listLength || 3),
    });

    this.form.get('itemType').valueChanges.pipe(takeUntil(this._destroyed)).subscribe(itemType => {
      this.issuesRenderer.initialize(itemType);
    });
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  edit() {
    const result: Widget = {
      title: this.form.value.title,
      options: this.issuesRenderer.options.getState(),
      itemType: this.form.value.itemType,
      displayType: this.form.value.displayType,
    };

    if (result.displayType === 'list') {
      result.listLength = this.form.value.listLength;
    }

    this.dialogRef.close(result);
  }
}
