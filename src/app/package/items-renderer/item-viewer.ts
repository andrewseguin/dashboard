import {BehaviorSubject} from 'rxjs';

export interface ViewingMetadata<V> {
  id: V;
  label: string;
}

export class ItemViewer<V> {
  set views(views: Set<V>) {
    this.views$.next(views);
  }
  get views(): Set<V> {
    return this.views$.value;
  }
  views$ = new BehaviorSubject<Set<V>>(new Set<V>());

  constructor(public metadata: Map<V, ViewingMetadata<V>>) {}

  getViews(): ViewingMetadata<V>[] {
    const views: ViewingMetadata<V>[] = [];
    this.metadata.forEach(view => views.push(view));
    return views;
  }

  toggle(view: V) {
    const currentViews = this.views;
    const newViews = new Set(currentViews);
    currentViews.has(view) ? newViews.delete(view) : newViews.add(view);
    this.views = newViews;
  }
}
