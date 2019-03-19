import {BehaviorSubject} from 'rxjs';

export interface ViewingMetadata<V> {
  id: V;
  label: string;
}



export class ItemViewer<V> {
  set view(view: V|null) {
    this.view$.next(view);
  }
  get view(): V|null {
    return this.view$.value;
  }
  view$ = new BehaviorSubject<V|null>(null);

  constructor(public metadata: Map<V, ViewingMetadata<V>>) {}

  toggleView(viewId: V) {
    const
  }

  getView(): ViewingMetadata<V>[] {
    const views: ViewingMetadata<V>[] = [];
    this.metadata.forEach(view => views.push(view));
    return views;
  }
}
