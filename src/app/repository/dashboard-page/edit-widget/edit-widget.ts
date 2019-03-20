import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ItemViewer} from 'app/package/items-renderer/item-viewer';
import {ActiveRepo} from 'app/repository/services/active-repo';
import {Widget, WidgetDisplayTypeOptions} from 'app/repository/services/dao/dashboard';
import {Query} from 'app/repository/services/dao/query';
import {Recommendation} from 'app/repository/services/dao/recommendation';
import {
  getItemsList,
  GithubItemGroupsDataSource
} from 'app/repository/services/github-item-groups-data-source';
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

  private _destroyed = new Subject();

  public itemGroupsDataSource =
      new GithubItemGroupsDataSource(this.itemRecommendations, this.activeRepo);

  public itemViewer = new ItemViewer<GithubItemView>(GithubItemViewerMetadata);

  displayTypes = [
    {id: 'count', label: 'Count'},
    {id: 'list', label: 'List'},
    {id: 'pie', label: 'Pie Chart'},
    {id: 'timeSeries', label: 'Time Series'},
  ];

  itemCount = this.itemGroupsDataSource.connect().pipe(map(result => result.count));

  displayTypeOptions: WidgetDisplayTypeOptions;

  constructor(
      private itemRecommendations: ItemRecommendations, private activeRepo: ActiveRepo,
      private cd: ChangeDetectorRef, private dialogRef: MatDialogRef<EditWidget<S, V, G>, Widget>,
      @Inject(MAT_DIALOG_DATA) public data: EditWidgetData) {
    if (data && data.widget) {
      this.form.setValue({
        title: data.widget.title,
        itemType: data.widget.itemType,
        displayType: data.widget.displayType,
      });

      this.itemGroupsDataSource.dataProvider =
          getItemsList(this.activeRepo.activeStore, data.widget.itemType);
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
    const widget: Widget = {
      title: this.form.value.title,
      itemType: this.form.value.itemType,
      filtererState: this.itemGroupsDataSource.filterer.getState(),
      displayType: this.form.value.displayType,
      displayTypeOptions: this.displayTypeOptions
    };

    this.dialogRef.close(widget);
  }

  loadFromQuery(query: Query) {
    if (query.filtererState) {
      this.itemGroupsDataSource.filterer.setState(query.filtererState);
    }
  }

  loadFromRecommendation(recommendation: Recommendation) {
    if (recommendation.filtererState) {
      this.itemGroupsDataSource.filterer.setState(recommendation.filtererState);
    }
  }
}
