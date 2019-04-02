import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export interface ItemViewerState<V> {
  views: V[];
}

export interface ViewingMetadata<V, C> {
  id: V;
  label: string;
  containerClassList?: string;
  containerStyles?: {[key in string]: string};
  render: (context: C) => ({
    text: string,
    classList?: string,
    styles?: {[key in string]: string},
  }[]);
}

export type ItemViewerContextProvider<T, C> = Observable<(item: T) => C>;

export class ItemViewer<T, V, C> {
  state = new BehaviorSubject<ItemViewerState<V>>({views: []});

  constructor(
      public metadata: Map<V, ViewingMetadata<V, C>>,
      private contextProvider: ItemViewerContextProvider<T, C>) {}

  getViews(): ViewingMetadata<V, C>[] {
    const views: ViewingMetadata<V, C>[] = [];
    this.metadata.forEach(view => views.push(view));
    return views;
  }

  toggle(view: V) {
    const views = this.getState().views;

    const newViews = [...views];
    const index = views.indexOf(view);
    if (index !== -1) {
      newViews.splice(index, 1);
    } else {
      newViews.push(view);
    }

    this.setState({views: newViews});
  }

  getState(): ItemViewerState<V> {
    return this.state.value;
  }

  setState(state: ItemViewerState<V>) {
    this.state.next({...state});
  }

  isEquivalent(otherState: ItemViewerState<V>) {
    const thisViews = this.getState().views.slice().sort();
    const otherViews = otherState.views.slice().sort();

    return thisViews.length === otherViews.length && thisViews.every((v, i) => otherViews[i] === v);
  }

  render(item: T, view: ViewingMetadata<V, C>) {
    return this.contextProvider.pipe(map(c => view.render(c(item))));
  }
}
