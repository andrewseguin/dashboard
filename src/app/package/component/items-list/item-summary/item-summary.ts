import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges
} from '@angular/core';
import {Viewer, ViewerMetadata} from 'app/package/data-source/viewer';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'item-summary',
  templateUrl: 'item-summary.html',
  styleUrls: ['item-summary.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'(click)': 'select.emit(item)'}
})
export class ItemSummary<T, V> {
  views: Observable<ViewerMetadata<V, any>[]>;

  @Input() item: T;

  @Input() active: boolean;

  @Input() viewer: Viewer<T, V, any>;

  @Output() select = new EventEmitter<T>();

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['viewer'] && this.viewer) {
      this.views = this.viewer.state.pipe(map(state => {
        const enabledViews =
            this.viewer.getViews().filter(view => state.views.indexOf(view.id) !== -1);
        return enabledViews.map(view => this.viewer.metadata.get(view.id)!);
      }));
    }
  }
}
