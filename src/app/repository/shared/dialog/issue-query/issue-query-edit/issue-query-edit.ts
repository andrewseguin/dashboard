import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

export interface IssueQueryEditData {
  name: string;
  group: string;
}

@Component({
  styleUrls: ['issue-query-edit.scss'],
  templateUrl: 'issue-query-edit.html',
  host: {
    '(keyup.Enter)': 'save()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueQueryEdit {
  constructor(public dialogRef: MatDialogRef<IssueQueryEdit>,
              @Inject(MAT_DIALOG_DATA) public data: IssueQueryEditData) {
    if (data && data.name) {
      this.formGroup.get('name').setValue(data.name);
    }

    if (data && data.group) {
      this.formGroup.get('group').setValue(data.group);
    }
  }

  formGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    group: new FormControl('')
  });

  save() {
    if (this.formGroup.valid) {
      this.dialogRef.close({
        name: this.formGroup.get('name').value,
        group: this.formGroup.get('group').value
      });
    }
  }
}
