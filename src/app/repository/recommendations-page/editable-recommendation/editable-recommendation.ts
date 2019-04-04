import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MatDialog, MatSnackBar} from '@angular/material';
import {Item} from 'app/github/app-types/item';
import {Filterer} from 'app/package/data-source/filterer';
import {DataSource} from 'app/package/data-source/data-source';
import {DataSourceProvider} from 'app/package/utility/data-source-provider';
import {DATA_SOURCES} from 'app/repository/repository';
import {ActiveStore} from 'app/repository/services/active-store';
import {Recommendation} from 'app/repository/services/dao/config/recommendation';
import {
  DeleteConfirmation
} from 'app/repository/shared/dialog/delete-confirmation/delete-confirmation';
import {EXPANSION_ANIMATION} from 'app/utility/animations';
import {combineLatest, of, Subject} from 'rxjs';
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

  queryChanged = new Subject<void>();

  itemsFilterer: Filterer<Item>;

  provider: DataSource<any>;

  @Input() recommendation: Recommendation;

  form: FormGroup;

  actionTypeOptions = [
    {label: 'No action', value: 'none'}, {label: 'Add label', value: 'add-label'},
    {label: 'Add assignee', value: 'add-assignee'}
  ];

  actionLabels = [];
  actionAssignees = [];

  addLabelsOptions =
      this.activeRepo.data.pipe(mergeMap(store => store.labels.list), map(labels => {
                                  const labelNames = labels.map(l => l.name);
                                  labelNames.sort();
                                  return labelNames.map(name => ({id: name, label: name}));
                                }));

  addAssigneesOptions =
      this.activeRepo.data.pipe(mergeMap(store => store.items.list), map(items => {
                                  const assigneesSet = new Set<string>();
                                  items.forEach(i => i.assignees.forEach(a => assigneesSet.add(a)));
                                  const assigneesList: string[] = [];
                                  assigneesSet.forEach(a => assigneesList.push(a));
                                  return assigneesList.sort().map(a => ({id: a, label: a}));
                                }));

  private _destroyed = new Subject();

  constructor(
      @Inject(DATA_SOURCES) public dataSources: Map<string, DataSourceProvider>,
      private cd: ChangeDetectorRef, private activeRepo: ActiveStore, private snackbar: MatSnackBar,
      private dialog: MatDialog) {}

  ngOnInit() {
    this.form = new FormGroup({
      message: new FormControl(this.recommendation.message),
      type: new FormControl(this.recommendation.type || 'warning'),
      actionType: new FormControl(this.recommendation.actionType || 'add-label'),
      action: new FormControl(this.recommendation.action),
    });

    // TODO: This should be set by the recommendation
    this.itemsFilterer = this.dataSources.get('issue')!.filterer();
    this.provider = this.dataSources.get('issue')!.dataSource();


    const filtererState = this.recommendation.filtererState ||
        {filters: [{query: {equality: 'is', state: 'open'}, type: 'state'}], search: ''};
    this.itemsFilterer.setState(filtererState);

    this.form.get('actionType')!.valueChanges.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this.form.get('action')!.setValue(null);
    });
  }

  ngAfterViewInit() {
    const configStore = this.activeRepo.activeConfig;
    combineLatest(this.form.valueChanges, this.itemsFilterer.state)
        .pipe(debounceTime(100), takeUntil(this._destroyed))
        .subscribe(results => {
          configStore.recommendations.update({
            ...this.recommendation,
            message: results[0].message,
            type: results[0].type,
            actionType: results[0].actionType,
            action: results[0].action,
            filtererState: results[1]
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
