import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Widget} from 'app/repository/services/dao/dashboards-dao';
import {
  IssueRendererOptions,
  IssueRendererOptionsState
} from 'app/repository/services/issues-renderer/issue-renderer-options';
import {IssuesFilterMetadata} from 'app/repository/services/issues-renderer/issues-filter-metadata';
import {IssuesRenderer} from 'app/repository/services/issues-renderer/issues-renderer';
import {Filter} from 'app/repository/utility/search/filter';
import {Subject} from 'rxjs';

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

  metadata = IssuesFilterMetadata;

  constructor(
      private dialogRef: MatDialogRef<EditWidget, Widget>, private issuesRenderer: IssuesRenderer,
      @Inject(MAT_DIALOG_DATA) public data: EditWidgetData) {
    this.widget = {...data.widget};
    this.issuesRenderer.options.setState(data.widget.options);
    this.form = new FormGroup({
      title: new FormControl(this.widget.title),
    });
  }

  edit() {
    const result:
        Widget = {title: this.form.value.title, options: this.issuesRenderer.options.getState()};
    this.dialogRef.close(result);
  }
}
