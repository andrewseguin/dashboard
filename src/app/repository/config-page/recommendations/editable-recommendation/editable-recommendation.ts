import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MatDialog, MatSnackBar} from '@angular/material';
import {Recommendation, RecommendationsDao} from 'app/repository/services/dao/recommendations-dao';
import {DeleteConfirmation} from 'app/repository/shared/dialog/delete-confirmation/delete-confirmation';
import {of, Subject, combineLatest, merge} from 'rxjs';
import {debounceTime, take, takeUntil} from 'rxjs/operators';
import {IssuesFilterMetadata} from 'app/repository/services/issues-renderer/issues-filter-metadata';
import {Filter} from 'app/repository/utility/search/filter';

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

  private _destroyed = new Subject();

  constructor(private recommendationsDao: RecommendationsDao,
    private snackbar: MatSnackBar,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.form = new FormGroup({
      message: new FormControl(this.recommendation.message),
      type: new FormControl(this.recommendation.type || 'warning'),
      action: new FormControl(this.recommendation.action || 'apply-label'),
    });
    this._search = this.recommendation.search;
    this._filters = this.recommendation.filters || [];

    merge(this.form.valueChanges, this.queryChanged).pipe(
      debounceTime(2000),
      takeUntil(this._destroyed))
      .subscribe(() => {
        const update: Recommendation = {
          message: this.form.value.message,
          type: this.form.value.type,
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

    this.dialog.open(DeleteConfirmation, {data}).afterClosed().pipe(
      take(1))
      .subscribe(confirmed => {
        if (confirmed) {
          this.recommendationsDao.remove(this.recommendation.id);
          this.snackbar.open(`Recommendation deleted`, null, {duration: 2000});
        }
      });
  }
}
