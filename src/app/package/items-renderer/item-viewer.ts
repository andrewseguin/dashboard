import {BehaviorSubject} from 'rxjs';

export interface ItemViewerState<V> {
  views: V[];
}

export interface ViewingMetadata<V> {
  id: V;
  label: string;
}

export class ItemViewer<V> {
  set views(views: V[]) {
    this.views$.next(views);
  }
  get views(): V[] {
    return this.views$.value;
  }
  views$ = new BehaviorSubject<V[]>([]);

  constructor(public metadata: Map<V, ViewingMetadata<V>>) {}

  getViews(): ViewingMetadata<V>[] {
    const views: ViewingMetadata<V>[] = [];
    this.metadata.forEach(view => views.push(view));
    return views;
  }

  toggle(view: V) {
    const newViews = [...this.views];
    const index = this.views.indexOf(view);
    if (index !== -1) {
      newViews.splice(index, 1);
    } else {
      newViews.push(view);
    }

    this.views = newViews;
  }

  getState(): ItemViewerState<V> {
    return {views: this.views};
  }

  setState(state: ItemViewerState<V>) {
    this.views = state.views;
  }
}
