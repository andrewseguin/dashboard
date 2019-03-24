import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ActiveStore} from 'app/repository/services/active-store';
import {Recommendation} from 'app/repository/services/dao/config/recommendation';
import {createItemsFilterer} from 'app/repository/services/github-item-groups-data-source';
import {ItemRecommendations} from 'app/repository/services/item-recommendations';
import {
  DeleteConfirmation
} from 'app/repository/shared/dialog/delete-confirmation/delete-confirmation';
import {EXPANSION_ANIMATION} from 'app/utility/animations';
import {merge, of, Subject} from 'rxjs';
import {debounceTime, map, mergeMap, take, takeUntil} from 'rxjs/operators';


@Component({
  selector: 'editable-recommendation',
  styleUrls: ['editable-recommendation.scss'],
  templateUrl: 'editable-recommendation.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.theme-background-card]': 'expanded',
    '[class.theme-border]': 'expanded',
    '[style.margin-bottom.px]': 'expanded ? 24 : 0',
    '[style.padding]': `expanded ? '16px' : '4px 16px'`
  },
  animations: EXPANSION_ANIMATION
})
export class EditableRecommendation {
  expanded = true;

  itemsFilterer = createItemsFilterer(this.itemRecommendations, this.activeRepo.activeData);

  queryChanged = new Subject<void>();

  @Input() recommendation: Recommendation;

  form: FormGroup;

  actionTypeOptions = [
    {label: 'No action', value: 'none'}, {label: 'Add label', value: 'add-label'},
    {label: 'Add assignee', value: 'add-assignee'}
  ];

  actionLabels = [];
  actionAssignees = [];

  addLabelsAutocomplete =
      this.activeRepo.data.pipe(mergeMap(store => store.labels.list), map(labels => {
                                  const labelNames = labels.map(l => l.name);
                                  labelNames.sort();
                                  return labelNames.map(name => ({id: name, label: name}));
                                }));

  addAssigneesAutocomplete =
      this.activeRepo.data.pipe(mergeMap(store => store.items.list), map(items => {
                                  const assigneesSet = new Set<string>();
                                  items.forEach(i => i.assignees.forEach(a => assigneesSet.add(a)));
                                  const assigneesList: string[] = [];
                                  assigneesSet.forEach(a => assigneesList.push(a));
                                  return assigneesList.sort().map(a => ({id: a, label: a}));
                                }));

  private _destroyed = new Subject();

  constructor(
      private itemRecommendations: ItemRecommendations, private cd: ChangeDetectorRef,
      private activeRepo: ActiveStore, private snackbar: MatSnackBar, private dialog: MatDialog) {}

  ngOnInit() {
    this.form = new FormGroup({
      message: new FormControl(this.recommendation.message),
      type: new FormControl(this.recommendation.type || 'warning'),
      actionType: new FormControl(this.recommendation.actionType || 'add-label'),
      action: new FormControl(this.recommendation.action),
    });

    const filtererState = this.recommendation.filtererState ||
        {filters: [{query: {equality: 'is', state: 'open'}, type: 'state'}], search: ''};
    this.itemsFilterer.setState(filtererState);

    this.form.get('actionType')!.valueChanges.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this.form.get('action')!.setValue(null);
    });
  }

  ngAfterViewInit() {
    const configStore = this.activeRepo.activeConfig;
    merge(this.form.valueChanges, this.itemsFilterer.state)
        .pipe(debounceTime(100), takeUntil(this._destroyed))
        .subscribe(() => {
          configStore.recommendations.update({
            ...this.recommendation,
            message: this.form.value.message,
            type: this.form.value.type,
            actionType: this.form.value.actionType,
            action: this.form.value.action,
            filtererState: this.itemsFilterer.getState()
          });
        });
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  deleteRecommendation() {
    const configStore = this.activeRepo.activeConfig;
    const data = {name: of('this recommendation')};

    this.dialog.open(DeleteConfirmation, {data})
        .afterClosed()
        .pipe(take(1))
        .subscribe(confirmed => {
          if (confirmed) {
            configStore.recommendations.remove(this.recommendation.id!);
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

  collapse() {
    this.expanded = false;
    this.cd.markForCheck();
  }
}
