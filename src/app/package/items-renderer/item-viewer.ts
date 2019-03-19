import {BehaviorSubject} from 'rxjs';

export interface ItemViewerState<V> {
  views: V[];
}

export interface ViewingMetadata<V> {
  id: V;
  label: string;
}

export class ItemViewer<V> {
  state = new BehaviorSubject<ItemViewerState<V>>({views: []});

  constructor(public metadata: Map<V, ViewingMetadata<V>>) {}

  getViews(): ViewingMetadata<V>[] {
    const views: ViewingMetadata<V>[] = [];
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
}
