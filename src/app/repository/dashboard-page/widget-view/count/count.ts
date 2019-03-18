import {ChangeDetectionStrategy, Component, Input, SimpleChanges} from '@angular/core';
import {ActiveRepo} from 'app/repository/services/active-repo';
import {Widget} from 'app/repository/services/dao';
import {getItemsList, GithubItemsRenderer} from 'app/repository/services/github-items-renderer';
import {map} from 'rxjs/operators';
import { ItemRecommendations } from 'app/repository/services/item-recommendations';

@Component({
  selector: 'count',
  templateUrl: 'count.html',
  styleUrls: ['count.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Count {
  @Input() widget: Widget;

  public itemsRenderer = new GithubItemsRenderer(this.itemRecommendations, this.activeRepo);

  count = this.itemsRenderer.connect().pipe(map(result => result.count));

  constructor(private itemRecommendations: ItemRecommendations, private activeRepo: ActiveRepo) {}

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['widget'] && this.widget) {
      this.itemsRenderer.dataProvider =
          getItemsList(this.activeRepo.activeStore, this.widget.itemType);
      this.itemsRenderer.options.filters = this.widget.options.filters;
      this.itemsRenderer.options.search = this.widget.options.search;
    }
  }
}
