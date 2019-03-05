import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {IssueQueriesDao} from 'app/repository/services/dao/issue-queries-dao';
import {combineLatest} from 'rxjs';
import {filter, map, startWith} from 'rxjs/operators';

export interface IssueQueryEditData {
  name: string;
  group: string;
}

@Component({
  styleUrls: ['issue-query-edit.scss'],
  templateUrl: 'issue-query-edit.html',
  host: {'(keyup.Enter)': 'save()'},
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueQueryEdit {
  formGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    group: new FormControl('')
  });

  filteredGroupOptions =
      combineLatest(this.issueQueriesDao.list, this.formGroup.valueChanges)
          .pipe(filter(result => !!result[0] && !!result[1]), map(result => {
                  const issueQueries = result[0];
                  const groupOptionsSet = new Set<string>();
                  issueQueries.forEach(
                      issueQuery => groupOptionsSet.add(issueQuery.group));

                  const groupOptions = [];
                  groupOptionsSet.forEach(
                      groupOption => groupOptions.push(groupOption));
                  return this._filter(this.formGroup.value.group, groupOptions);
                }));

  constructor(
      public dialogRef: MatDialogRef<IssueQueryEdit>,
      public issueQueriesDao: IssueQueriesDao,
      @Inject(MAT_DIALOG_DATA) public data: IssueQueryEditData) {
    if (data && data.name) {
      this.formGroup.get('name').setValue(data.name);
    }

    if (data && data.group) {
      this.formGroup.get('group').setValue(data.group);
    }
  }


  save() {
    if (this.formGroup.valid) {
      this.dialogRef.close({
        name: this.formGroup.get('name').value,
        group: this.formGroup.get('group').value
      });
    }
  }

  private _filter(value: string, values: string[]): string[] {
    const filterValue = value.toLowerCase();
    return values.filter(option => option.toLowerCase().includes(filterValue));
  }
}
