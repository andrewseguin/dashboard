import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MatDialog, MatSnackBar} from '@angular/material';
import {Filter} from 'app/package/items-renderer/search-utility/filter';
import {Recommendation} from 'app/repository/services/dao/recommendations-dao';
import {
  DeleteConfirmation
} from 'app/repository/shared/dialog/delete-confirmation/delete-confirmation';
import {ItemsFilterMetadata} from 'app/repository/utility/items-renderer/items-filter-metadata';
import {EXPANSION_ANIMATION} from 'app/utility/animations';
import {getAssignees} from 'app/utility/assignees-autocomplete';
import {merge, of, Subject} from 'rxjs';
import {debounceTime, filter, map, take, takeUntil} from 'rxjs/operators';
import { Dao } from 'app/repository/services/dao/dao';


@Component({
  selector: 'editable-recommendation',
  styleUrls: ['editable-recommendation.scss'],
  templateUrl: 'editable-recommendation.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.theme-background-card]': 'expanded',
    '[class.theme-border]': 'expanded',
    '[style.margin-bottom.px]': 'expanded ? 8 : 0',
    '[style.padding]': `expanded ? '16px' : '4px 16px'`
  },
  animations: EXPANSION_ANIMATION
})
export class EditableRecommendation {
  expanded = false;

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

  metadata = ItemsFilterMetadata;

  actionTypeOptions = [
    {label: 'No action', value: 'none'}, {label: 'Add label', value: 'add-label'},
    {label: 'Add assignee', value: 'add-assignee'}
  ];

  actionLabels = [];
  actionAssignees = [];

  addLabelsAutocomplete = this.dao.labels.list.pipe(
      filter(list => !!list), map(labels => labels!.map(l => l.name).sort()));

  addAssigneesAutocomplete =
      this.dao.items.list.pipe(filter(list => !!list), map(items => getAssignees(items!)));

  private _destroyed = new Subject();

  constructor(
      private cd: ChangeDetectorRef, private dao: Dao, private snackbar: MatSnackBar,
      private dialog: MatDialog) {}

  ngOnInit() {
    this.form = new FormGroup({
      message: new FormControl(this.recommendation.message),
      type: new FormControl(this.recommendation.type || 'warning'),
      actionType: new FormControl(this.recommendation.actionType || 'add-label'),
      action: new FormControl(this.recommendation.action),
    });

    this._search = this.recommendation.search || '';
    this._filters = this.recommendation.filters || [];

    this.form.get('actionType')!.valueChanges.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this.form.get('action')!.setValue(null);
    });
  }

  ngAfterViewInit() {
    merge(this.form.valueChanges, this.queryChanged)
        .pipe(debounceTime(2000), takeUntil(this._destroyed))
        .subscribe(() => {
          this.dao.recommendations.update({
            ...this.recommendation,
            message: this.form.value.message,
            type: this.form.value.type,
            actionType: this.form.value.actionType,
            action: this.form.value.action,
            filters: this.filters,
            search: this.search
          });
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
            this.dao.recommendations.remove(this.recommendation.id!);
            this.snackbar.open(`Recommendation deleted`, undefined, {duration: 2000});
          }
        });
  }

  setAddLabelAction(name: string[]) {
    this.form.get('action')!.setValue({labels: name});
  }

  setAddAssigneeAction(name: string[]) {
    this.form.get('action')!.setValue({assignees: name});
  }

  expand() {
    this.expanded = true;
    this.cd.markForCheck();
  }
}
