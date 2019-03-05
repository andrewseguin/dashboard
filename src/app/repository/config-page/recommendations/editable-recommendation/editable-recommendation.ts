import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MatDialog, MatSnackBar} from '@angular/material';
import {Recommendation, RecommendationsDao} from 'app/repository/services/dao/recommendations-dao';
import {IssuesFilterMetadata} from 'app/repository/services/issues-renderer/issues-filter-metadata';
import {DeleteConfirmation} from 'app/repository/shared/dialog/delete-confirmation/delete-confirmation';
import {Filter} from 'app/repository/utility/search/filter';
import {RepoDao} from 'app/service/repo-dao';
import {combineLatest, merge, of, Subject} from 'rxjs';
import {debounceTime, filter, map, take, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'editable-recommendation',
  styleUrls: ['editable-recommendation.scss'],
  templateUrl: 'editable-recommendation.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'theme-background-card theme-border',
  }
})
export class EditableRecommendation {
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

  @Input() recommendation: Recommendation;

  form: FormGroup;

  metadata = IssuesFilterMetadata;

  actionTypeOptions = [
    {label: 'Add label', value: 'add-label'},
    {label: 'Add assignee', value: 'add-assignee'}
  ];

  actionLabels = [];
  actionAssignees = [];

  addLabelsAutocomplete = this.repoDao.repo.pipe(
      filter(repo => !!repo), map(repo => repo.labels.map(l => l.name)));

  private _destroyed = new Subject();

  constructor(
      private recommendationsDao: RecommendationsDao, public repoDao: RepoDao,
      private snackbar: MatSnackBar, private dialog: MatDialog) {}

  ngOnInit() {
    this.form = new FormGroup({
      message: new FormControl(this.recommendation.message),
      type: new FormControl(this.recommendation.type || 'warning'),
      actionType:
          new FormControl(this.recommendation.actionType || 'add-label'),
      action: new FormControl(this.recommendation.action),
    });

    this._search = this.recommendation.search;
    this._filters = this.recommendation.filters || [];

    merge(this.form.valueChanges, this.queryChanged)
        .pipe(debounceTime(2000), takeUntil(this._destroyed))
        .subscribe(() => {
          const update: Recommendation = {
            message: this.form.value.message,
            type: this.form.value.type,
            actionType: this.form.value.actionType,
            action: this.form.value.action,
            filters: this.filters,
            search: this.search
          };

          this.recommendationsDao.update(this.recommendation.id, update);
        });
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  deleteRecommendation() {
    const data = {name: of('this recommendation')};

    this.dialog.open(DeleteConfirmation, {data})
        .afterClosed()
        .pipe(take(1))
        .subscribe(confirmed => {
          if (confirmed) {
            this.recommendationsDao.remove(this.recommendation.id);
            this.snackbar.open(
                `Recommendation deleted`, null, {duration: 2000});
          }
        });
  }

  setAddLabelAction(labelNames: number[]) {
    this.form.get('action').setValue({labels: labelNames});
  }
}
