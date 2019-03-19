import {ChangeDetectionStrategy, Component, Input, SimpleChanges} from '@angular/core';
import {MatDialog} from '@angular/material';
import {ItemViewer} from 'app/package/items-renderer/item-viewer';
import {Item, ListDisplayTypeOptions} from 'app/repository/services/dao';
import {GithubItemsRenderer} from 'app/repository/services/github-items-renderer';
import {ItemDetailDialog} from 'app/repository/shared/dialog/item-detail-dialog/item-detail-dialog';
import {
  GithubItemView,
  GithubItemViewerMetadata
} from 'app/repository/utility/items-renderer/item-viewer-metadata';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'list',
  templateUrl: 'list.html',
  styleUrls: ['list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class List<S> {
  trackById = (_i: number, item: Item) => item.id;

  @Input() itemsRenderer: GithubItemsRenderer;

  @Input() options: ListDisplayTypeOptions<S, GithubItemView>;

  items: Observable<Item[]>;

  public itemViewer = new ItemViewer<GithubItemView>(GithubItemViewerMetadata);

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    this.items = this.itemsRenderer.connect().pipe(map(result => result.groups[0].items));
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['options'] && this.options) {
      this.itemsRenderer.sorter.setState(this.options.sorterState);
      this.itemViewer.setState(this.options.viewerState);
    }
  }

  openItemModal(itemId: number) {
    this.dialog.open(ItemDetailDialog, {data: {itemId: `${itemId}`}, width: '80vw'});
  }
}
