import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ItemViewer} from 'app/package/items-renderer/item-viewer';
import {ActiveRepo} from 'app/repository/services/active-repo';
import {
  CountDisplayTypeOptions,
  DisplayType,
  ListDisplayTypeOptions,
  PieChartDisplayTypeOptions,
  TimeSeriesDisplayTypeOptions,
  Widget,
  WidgetDisplayTypeOptions
} from 'app/repository/services/dao/dashboard';
import {Query} from 'app/repository/services/dao/query';
import {Recommendation} from 'app/repository/services/dao/recommendation';
import {getItemsList, GithubItemGroupsDataSource} from 'app/repository/services/github-item-groups-data-source';
import {ItemRecommendations} from 'app/repository/services/item-recommendations';
import {ItemsFilterMetadata} from 'app/repository/utility/items-renderer/item-filter-metadata';
import {
  GithubItemGroupingMetadata,
  Group
} from 'app/repository/utility/items-renderer/item-grouper-metadata';
import {
  GithubItemView,
  GithubItemViewerMetadata
} from 'app/repository/utility/items-renderer/item-viewer-metadata';
import {Subject} from 'rxjs';
import {map, mergeMap, takeUntil} from 'rxjs/operators';

export interface EditWidgetData {
  widget: Widget;
}

@Component({
  templateUrl: 'edit-widget.html',
  styleUrls: ['edit-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditWidget<S, V, G> {
  queryChanged = new Subject<void>();

  form = new FormGroup({
    title: new FormControl(''),
    itemType: new FormControl('issue'),
    displayType: new FormControl('list'),
  });

  recommendationsList = this.activeRepo.store.pipe(mergeMap(store => store.recommendations.list));

  metadata = ItemsFilterMetadata;

  recommendations = this.activeRepo.store.pipe(mergeMap(store => store.recommendations.list));

  issueQueries = this.activeRepo.store.pipe(
      mergeMap(store => store.queries.list),
      map(queries => queries.filter(q => q.type === 'issue')));
  prQueries = this.activeRepo.store.pipe(
      mergeMap(store => store.queries.list), map(queries => queries.filter(q => q.type === 'pr')));

  groups = GithubItemGroupingMetadata;
  groupIds: Group[];

  displayTypeOptionsForm: {[key in DisplayType]: FormGroup} = {
    count: new FormGroup({fontSize: new FormControl('normal')}),
    list: new FormGroup({listLength: new FormControl(5)}),
    pie: new FormGroup({
      group: new FormControl('label'),
      filteredGroupsByTitle: new FormControl(''),
    }),
    'time-series': new FormGroup({
      start: new FormControl(),
      end: new FormControl(),
      group: new FormControl('week'),
      datasets: new FormControl('open'),
    })
  };

  private _destroyed = new Subject();

  public itemGroupsDataSource = new GithubItemGroupsDataSource(this.itemRecommendations, this.activeRepo);

  public itemViewer = new ItemViewer<GithubItemView>(GithubItemViewerMetadata);

  constructor(
      private itemRecommendations: ItemRecommendations, private activeRepo: ActiveRepo,
      private cd: ChangeDetectorRef, private dialogRef: MatDialogRef<EditWidget<S, V, G>, Widget>,
      @Inject(MAT_DIALOG_DATA) public data: EditWidgetData) {
    this.groupIds = [];
    this.groups.forEach(g => {
      if (g.label) {
        this.groupIds.push(g.id);
      }
    });

    if (data && data.widget) {
      this.form.setValue({
        title: data.widget.title,
        itemType: data.widget.itemType,
        displayType: data.widget.displayType,
      });

      this.itemGroupsDataSource.dataProvider =
          getItemsList(this.activeRepo.activeStore, data.widget.itemType);

      this.setDisplayTypeOptionsForm(data.widget.displayType, data.widget.displayTypeOptions);
    }

    this.itemGroupsDataSource.dataProvider = getItemsList(this.activeRepo.activeStore, 'issue');
    this.form.get('itemType')!.valueChanges.pipe(takeUntil(this._destroyed)).subscribe(type => {
      this.itemGroupsDataSource.dataProvider = getItemsList(this.activeRepo.activeStore, type);
      this.cd.markForCheck();
    });
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  edit() {
    let displayType = this.form.value.displayType as DisplayType;
    let displayTypeOptions: WidgetDisplayTypeOptions;

    const form = this.displayTypeOptionsForm[displayType];
    switch (displayType) {
      case 'count':
        displayTypeOptions = {
          fontSize: form.value.fontSize,
        };
        break;
      case 'list':
        displayTypeOptions = {
          listLength: form.value.listLength,
          sorterState: this.itemGroupsDataSource.sorter.getState(),
          viewerState: this.itemViewer.getState(),
        };
        break;
      case 'pie':
        displayTypeOptions = {
          grouperState: {group: form.value.group},
          filteredGroupsByTitle: form.value.filteredGroupsByTitle,
        };
        break;
      case 'time-series':
        const datasets = (form.value.datasets as string).split(',').map(v => v.trim());
        displayTypeOptions =
            {start: form.value.start, end: form.value.end, group: form.value.group, datasets};
        break;
      default:
        throw Error(`Could not set up options for type ${displayType}`);
    }

    const widget: Widget = {
      title: this.form.value.title,
      itemType: this.form.value.itemType,
      filtererState: this.itemGroupsDataSource.filterer.getState(),
      displayType: this.form.value.displayType,
      displayTypeOptions
    };

    this.dialogRef.close(widget);
  }

  loadFromRecommendation(recommendation: Recommendation) {
    if (recommendation.filtererState) {
      this.itemGroupsDataSource.filterer.setState(recommendation.filtererState);
    }
  }

  loadFromQuery(query: Query) {
    if (query.filtererState) {
      this.itemGroupsDataSource.filterer.setState(query.filtererState);
    }

    if (query.sorterState) {
      this.itemGroupsDataSource.sorter.setState(query.sorterState);
    }

    if (query.viewerState) {
      this.itemViewer.setState(query.viewerState);
    }
  }

  private setDisplayTypeOptionsForm(displayType: DisplayType, options: WidgetDisplayTypeOptions) {
    const form = this.displayTypeOptionsForm[displayType];
    switch (displayType) {
      case 'count':
        options = options as CountDisplayTypeOptions;
        form.get('fontSize')!.setValue(options.fontSize);
        break;

      case 'list':
        options = options as ListDisplayTypeOptions<S, V>;
        form.get('listLength')!.setValue(options.listLength);
        break;

      case 'pie':
        options = options as PieChartDisplayTypeOptions<G>;
        form.get('group')!.setValue(options.grouperState.group);
        form.get('filteredGroupsByTitle')!.setValue(options.filteredGroupsByTitle);
        break;

      case 'time-series':
        options = options as TimeSeriesDisplayTypeOptions;
        form.get('start')!.setValue(options.start);
        form.get('end')!.setValue(options.end);
        form.get('group')!.setValue(options.group);
        form.get('datasets')!.setValue(options.datasets);
        break;
    }
  }
}
