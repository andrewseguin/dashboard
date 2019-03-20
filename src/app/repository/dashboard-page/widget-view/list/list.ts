import {ChangeDetectionStrategy, Component, Input, SimpleChanges} from '@angular/core';
import {MatDialog} from '@angular/material';
import {ItemSorterState} from 'app/package/items-renderer/item-sorter';
import {ItemViewer, ItemViewerState} from 'app/package/items-renderer/item-viewer';
import {Item} from 'app/repository/services/dao';
import {GithubItemGroupsDataSource} from 'app/repository/services/github-item-groups-data-source';
import {ItemDetailDialog} from 'app/repository/shared/dialog/item-detail-dialog/item-detail-dialog';
import {
  GithubItemView,
  GithubItemViewerMetadata
} from 'app/repository/utility/items-renderer/item-viewer-metadata';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ConfigOption} from '../../edit-widget/widget-type-options/widget-type-options';

export interface ListDisplayTypeOptions<S, V> {
  listLength: number;
  sorterState: ItemSorterState<S>;
  viewerState: ItemViewerState<V>;
}

export function getListConfigOptions(options: ListDisplayTypeOptions<any, any>): ConfigOption[] {
  return [
    {
      id: 'listLength',
      type: 'input',
      label: 'Max list length',
      inputType: 'number',
      initialValue: options ? options.listLength || 5 : null,
    },
    {
      id: 'sorterState',
      type: 'sorterState',
      label: 'List sort',
      initialValue: options ? options.sorterState : null,
    },
    {
      id: 'viewerState',
      type: 'viewerState',
      label: 'View',
      initialValue: options ? options.viewerState : null,
    },
  ];
}

@Component({
  selector: 'list',
  templateUrl: 'list.html',
  styleUrls: ['list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class List<S> {
  trackById = (_i: number, item: Item) => item.id;

  @Input() itemGroupsDataSource: GithubItemGroupsDataSource;

  @Input() options: ListDisplayTypeOptions<S, GithubItemView>;

  items: Observable<Item[]>;

  public itemViewer = new ItemViewer<GithubItemView>(GithubItemViewerMetadata);

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    this.items = this.itemGroupsDataSource.connect().pipe(map(result => result.groups[0].items));
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['options'] && this.options) {
      this.itemGroupsDataSource.sorter.setState(this.options.sorterState);
      this.itemViewer.setState(this.options.viewerState);
    }
  }

  openItemModal(itemId: number) {
    this.dialog.open(ItemDetailDialog, {data: {itemId: `${itemId}`}, width: '80vw'});
  }
}
